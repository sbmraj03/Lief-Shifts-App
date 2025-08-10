'use client';

import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';

type Shift = {
  id: string;
  staffName: string;
  clockIn?: string;
  clockOut?: string;
  note?: string;
};

const initialData: Shift[] = [
  { id: '1', staffName: 'Alice', clockIn: '2025-08-05T08:00:00Z', clockOut: '2025-08-05T16:00:00Z' },
  { id: '2', staffName: 'Bob', clockIn: '2025-08-05T09:00:00Z' },
];

export default function ShiftsPage() {
  const [data, setData] = useState<Shift[]>(initialData);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const columns: ColumnsType<Shift> = [
    { title: 'Staff', dataIndex: 'staffName', key: 'staffName' },
    { title: 'Clock In', dataIndex: 'clockIn', key: 'clockIn', render: (val) => (val ? moment(val).format('YYYY-MM-DD HH:mm') : '-') },
    { title: 'Clock Out', dataIndex: 'clockOut', key: 'clockOut', render: (val) => (val ? moment(val).format('YYYY-MM-DD HH:mm') : '-') },
    { title: 'Note', dataIndex: 'note', key: 'note' },
  ];

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const onFinish = (values: any) => {
    const newShift: Shift = {
      id: String(Math.random()).slice(2),
      staffName: values.staffName,
      clockIn: values.clockIn ? values.clockIn.toISOString() : undefined,
      clockOut: values.clockOut ? values.clockOut.toISOString() : undefined,
      note: values.note,
    };
    setData((prev) => [newShift, ...prev]);
    form.resetFields();
    closeModal();
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openModal}>Add Shift</Button>
      </Space>

      <Table columns={columns} dataSource={data} rowKey={(r) => r.id} />

      <Modal title="Add Shift" open={isModalVisible} onCancel={closeModal} footer={null}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="staffName" label="Staff name" rules={[{ required: true, message: 'Please enter staff name' }]}>
            <Input />
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