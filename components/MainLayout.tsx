'use client';

import React from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  TeamOutlined,
} from '@ant-design/icons';

import { useUser } from '@/src/context/UserContext';
import { Avatar, Dropdown, Button, Space } from 'antd';
import { useRouter, usePathname } from 'next/navigation';

const { Header, Sider, Content } = Layout;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname(); // detect current route

  // Map routes to menu keys
  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/shifts', icon: <ClockCircleOutlined />, label: 'Shifts' },
    { key: '/staff', icon: <TeamOutlined />, label: 'Staff' },
    { key: '/analytics', icon: <BarChartOutlined />, label: 'Analytics' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div className="logo">Lief</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname ?? '/']} // highlight active
          onClick={({ key }) => router.push(key)} // navigate on click
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 16px',
            background: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div />

          <div>
            <Space>
              {!loading && user ? (
                <Dropdown
                  menu={{
                    items: [
                      { key: 'profile', label: <a href="#">Profile</a> },
                      { key: 'logout', label: <a href="/api/auth/logout">Logout</a> },
                    ],
                  }}
                >
                  <a onClick={(e) => e.preventDefault()}>
                    <Space>
                      <Avatar src={user.picture} />
                      <span>{user.name}</span>
                    </Space>
                  </a>
                </Dropdown>
              ) : (
                <a href="/api/auth/login">
                  <Button type="primary">Login</Button>
                </a>
              )}
            </Space>
          </div>
        </Header>

        <Content style={{ margin: '16px' }}>
          <div className="content-wrapper">{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
}