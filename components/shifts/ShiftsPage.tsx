'use client';

import React, { useState, useEffect } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { Table, Button, Modal, Form, Input, DatePicker, Space, message } from 'antd';
import moment from 'moment';
import { gql, useQuery, useMutation } from '@apollo/client';
import { haversineDistance } from '@/src/utils/geo';


const GET_SHIFTS = gql`
  query GetShifts {
    shifts {
      id
      note
      clockIn
      clockOut
      user { id name }
    }
    me {
      id
      name
      email
      shifts { id clockIn clockOut }
    }
  }
`;


const CREATE_SHIFT = gql`
  mutation CreateShift($data: CreateShiftInput!) {
    createShift(data: $data) { id note clockIn user { id name } }
  }`;


const CLOCK_IN = gql`
  mutation ClockIn($data: ClockInInput) { clockIn(data: $data) { id clockIn user { id name } } }`
  ;

const CLOCK_OUT = gql`
  mutation ClockOut($data: ClockOutInput) { clockOut(data: $data) { id clockOut user { id name } } }`
  ;



export default function ShiftsPage() {
  const { data, loading, error, refetch } = useQuery(GET_SHIFTS);
  const [createShift] = useMutation(CREATE_SHIFT);
  const [clockIn] = useMutation(CLOCK_IN);
  const [clockOut] = useMutation(CLOCK_OUT);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // site config from env
  const SITE_LAT = Number(process.env.NEXT_PUBLIC_SITE_LAT ?? '0');
  const SITE_LNG = Number(process.env.NEXT_PUBLIC_SITE_LNG ?? '0');
  const SITE_RADIUS = Number(process.env.NEXT_PUBLIC_SITE_RADIUS_METERS ?? '2000');

  // derive current user's open shift
  const me = data?.me;
  const openShift = me?.shifts?.find((s: any) => !s.clockOut) ?? null;

  const handleOpenModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const onFinish = async (values: any) => {
    const payload: any = {
      // If logged in, omit userId to let server map to context.user
      clockIn: values.clockIn ? values.clockIn.toISOString() : null,
      clockOut: values.clockOut ? values.clockOut.toISOString() : null,
      note: values.note ?? null,
    };

    await createShift({ variables: { data: payload } });
    form.resetFields();
    closeModal();
    refetch();
  };

  async function handleClockIn(note?: string) {
    // get user location
    if (!('geolocation' in navigator)) {
      message.error('Geolocation is not available in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const dist = haversineDistance(lat, lng, SITE_LAT, SITE_LNG);

      if (dist > SITE_RADIUS) {
        message.error(`You are ${Math.round(dist)}m away — outside the allowed perimeter (${SITE_RADIUS}m). Cannot clock in.`);
        return;
      }

      try {
        await clockIn({ variables: { data: { clockInLat: lat, clockInLng: lng, note } } });
        message.success('Clocked in successfully');
        refetch();
      } catch (err: any) {
        message.error('Clock in failed: ' + (err.message ?? String(err)));
      }
    }, (err) => {
      message.error('Geolocation error: ' + err.message);
    }, { enableHighAccuracy: true, timeout: 10000 });
  }

  async function handleClockOut(note?: string) {
    if (!('geolocation' in navigator)) {
      message.error('Geolocation is not available in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      try {
        await clockOut({ variables: { data: { clockOutLat: lat, clockOutLng: lng, note } } });
        message.success('Clocked out successfully');
        refetch();
      } catch (err: any) {
        message.error('Clock out failed: ' + (err.message ?? String(err)));
      }
    }, (err) => {
      message.error('Geolocation error: ' + err.message);
    }, { enableHighAccuracy: true, timeout: 10000 });
  }

  if (loading) return <div>Loading shifts...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        {!openShift ? (
          <Button type="primary" onClick={() => handleClockIn()}>Clock In</Button>
        ) : (
          <Button type="primary" danger onClick={() => handleClockOut()}>Clock Out</Button>
        )}

        <Button onClick={handleOpenModal}>Add Shift (manual)</Button>
      </Space>

      <Table
        columns={
          [
            { title: 'Staff', dataIndex: ['user', 'name'], key: 'staffName' },
            { title: 'Clock In', dataIndex: 'clockIn', key: 'clockIn', render: (val: any) => (val ? moment(val).format('YYYY-MM-DD HH:mm') : '-') },
            { title: 'Clock Out', dataIndex: 'clockOut', key: 'clockOut', render: (val: any) => (val ? moment(val).format('YYYY-MM-DD HH:mm') : '-') },
            { title: 'Note', dataIndex: 'note', key: 'note' },
          ]
        }
        dataSource={data?.shifts || []}
        rowKey={(r: any) => r.id}
      />

      <Modal title="Add Shift" open={isModalVisible} onCancel={closeModal} footer={null}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="clockIn" label="Clock In">
            <DatePicker showTime />
          </Form.Item>

          <Form.Item name="clockOut" label="Clock Out">
            <DatePicker showTime />
          </Form.Item>

          <Form.Item name="note" label="Note">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={closeModal}>Cancel</Button>
              <Button type="primary" htmlType="submit">Save</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
