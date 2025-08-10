'use client';

import React from 'react';
import { Layout, Menu } from 'antd';
import {
    DashboardOutlined,
    ClockCircleOutlined,
    BarChartOutlined,
    TeamOutlined,
} from '@ant-design/icons';

import Link from 'next/link';
import { useUser } from '@/src/context/UserContext';
import { Avatar, Dropdown, Button, Space } from 'antd';
import { useRouter } from 'next/navigation';


const { Header, Sider, Content } = Layout;

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useUser();
    const router = useRouter();
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible>
                <div className="logo">Lief</div>
                <Menu
                    theme="dark"
                    defaultSelectedKeys={['1']}
                    mode="inline"
                    items={[
                        { key: '1', icon: <DashboardOutlined />, label: 'Dashboard' },
                        { key: '2', icon: <ClockCircleOutlined />, label: 'Shifts' },
                        { key: '3', icon: <TeamOutlined />, label: 'Staff' },
                        { key: '4', icon: <BarChartOutlined />, label: 'Analytics' },
                    ]}
                />
            </Sider>

            <Layout>
                <Header style={{ padding: '0 16px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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