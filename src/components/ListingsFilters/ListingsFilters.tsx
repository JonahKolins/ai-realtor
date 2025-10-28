import React, { useState, useEffect } from 'react';
import { Card, Select, Input, Button, Space, Row, Col } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { IListingsRequestParams, ListingStatus, ListingType } from '../../api/network/listings';
import styles from './ListingsFilters.module.sass';

const { Search } = Input;

interface ListingsFiltersProps {
    currentParams: IListingsRequestParams;
    onFiltersChange: (params: IListingsRequestParams) => void;
    onReset: () => void;
    loading?: boolean;
}

const ListingsFilters: React.FC<ListingsFiltersProps> = ({
    currentParams,
    onFiltersChange,
    onReset,
    loading = false
}) => {
    const [localFilters, setLocalFilters] = useState<IListingsRequestParams>(currentParams);

    useEffect(() => {
        setLocalFilters(currentParams);
    }, [currentParams]);

    const handleFilterChange = (key: keyof IListingsRequestParams, value: any) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handleSearch = (value: string) => {
        handleFilterChange('q', value || undefined);
    };

    const handleReset = () => {
        setLocalFilters({});
        onReset();
    };

    const statusOptions = [
        { label: 'All statuses', value: undefined },
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'ready' },
        { label: 'Archived', value: 'archived' },
    ];

    const typeOptions = [
        { label: 'All types', value: undefined },
        { label: 'Sale', value: 'sale' },
        { label: 'Rent', value: 'rent' },
    ];

    const sortOptions = [
        { label: 'Date created (newest)', value: '-createdAt' },
        { label: 'Date created (oldest)', value: 'createdAt' },
        { label: 'Price (low to high)', value: 'price' },
        { label: 'Price (high to low)', value: '-price' },
        { label: 'Title (A-Z)', value: 'title' },
        { label: 'Title (Z-A)', value: '-title' },
    ];

    const hasActiveFilters = localFilters.status || localFilters.type || localFilters.q;

    return (
        <Card className={styles['filters-card']}>
            <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Search
                        placeholder="Search listings..."
                        allowClear
                        value={localFilters.q}
                        onSearch={handleSearch}
                        onChange={(e) => {
                            if (!e.target.value) {
                                handleSearch('');
                            }
                        }}
                        loading={loading}
                        enterButton={<SearchOutlined />}
                        size="middle"
                    />
                </Col>

                <Col xs={12} sm={6} md={4}>
                    <Select
                        placeholder="Status"
                        value={localFilters.status}
                        onChange={(value) => handleFilterChange('status', value)}
                        options={statusOptions}
                        style={{ width: '100%' }}
                        size="middle"
                        allowClear
                    />
                </Col>

                <Col xs={12} sm={6} md={4}>
                    <Select
                        placeholder="Type"
                        value={localFilters.type}
                        onChange={(value) => handleFilterChange('type', value)}
                        options={typeOptions}
                        style={{ width: '100%' }}
                        size="middle"
                        allowClear
                    />
                </Col>

                <Col xs={12} sm={8} md={4}>
                    <Select
                        placeholder="Sort"
                        value={localFilters.sort || '-createdAt'}
                        onChange={(value) => handleFilterChange('sort', value)}
                        options={sortOptions}
                        style={{ width: '100%' }}
                        size="middle"
                    />
                </Col>

                <Col xs={12} sm={4} md={4} lg={2}>
                    <Button
                        type="default"
                        icon={<ClearOutlined />}
                        onClick={handleReset}
                        disabled={!hasActiveFilters || loading}
                        style={{ width: '100%' }}
                        size="middle"
                    >
                        Reset
                    </Button>
                </Col>
            </Row>
        </Card>
    );
};

export default ListingsFilters;
