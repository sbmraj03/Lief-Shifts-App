'use client';
import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Space } from 'antd';
import moment from 'moment';
import { gql, useQuery, useMutation } from '@apollo/client';

const GET_SHIFTS = gql`
  query GetShifts {
    shifts {
      id
      note
      clockIn
      clockOut
      user { id name }
    }
  }
`;

const CREATE_SHIFT = gql`
  mutation CreateShift($data: CreateShiftInput!) {
    createShift(data: $data) {
      id
      note
      clockIn
      user { id name }
    }
  }
`;

export default function ShiftsPage() {
  const { data, loading, error, refetch } = useQuery(GET_SHIFTS);
  const [createShift] = useMutation(CREATE_SHIFT);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const columns = [
    { title: 'Staff', dataIndex: ['user', 'name'], key: 'staffName' },
    { title: 'Clock In', dataIndex: 'clockIn', key: 'clockIn', render: (val: any) => (val ? moment(val).format('YYYY-MM-DD HH:mm') : '-') },
    { title: 'Clock Out', dataIndex: 'clockOut', key: 'clockOut', render: (val: any) => (val ? moment(val).format('YYYY-MM-DD HH:mm') : '-') },
    { title: 'Note', dataIndex: 'note', key: 'note' },
  ];

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const onFinish = async (values: any) => {
    const payload: any = {
      userId: Number(values.userId),
      note: values.note || null,
      clockIn: values.clockIn ? values.clockIn.toISOString() : null,
      clockOut: values.clockOut ? values.clockOut.toISOString() : null,
    };

    await createShift({ variables: { data: payload } });
    form.resetFields();
    closeModal();
    refetch();
  };

  if (loading) return <div>Loading shifts...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openModal}>Add Shift</Button>
      </Space>

      <Table columns={columns} dataSource={data?.shifts || []} rowKey={(r: any) => r.id} />

      <Modal title="Add Shift" open={isModalVisible} onCancel={closeModal} footer={null}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="userId" label="Staff (userId)" rules={[{ required: true, message: 'Please enter userId' }]}>
            <Input placeholder="Enter userId (for now)" />
          </Form.Item>

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
