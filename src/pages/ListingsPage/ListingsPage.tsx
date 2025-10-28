import React, { useEffect, useState } from 'react';
import { Pagination, Empty, Spin, Alert, Typography } from 'antd';
import styles from './ListingsPage.module.sass';
import { BaseListings } from '../../classes/listings/BaseLisings';
import { IListing, IListingsRequestParams } from '../../api/network/listings';
import { arrayUtils } from '../../core/utils';
import { ListingCard } from '../../components/ListingCard';
import { ListingsFilters } from '../../components/ListingsFilters';

const { Title } = Typography;

const ListingsPage = React.memo(() => {
    const [listings, setListings] = useState<IListing[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(20);
    const [total, setTotal] = useState<number>(0);
    const [currentParams, setCurrentParams] = useState<IListingsRequestParams>({});

    useEffect(() => {
        BaseListings.instance.readListings();
        const onListingsChangedHandler = BaseListings.instance.listingsChanged.subscribe(handleListingsChanged);
        handleListingsChanged();

        return () => {
            onListingsChangedHandler?.dispose();
        };
    }, []);

    const handleListingsChanged = () => {
        const newListings = BaseListings.instance.listings;
        const newLoading = BaseListings.instance.loading;
        const newError = BaseListings.instance.error;
        const newPage = BaseListings.instance.page;
        const newLimit = BaseListings.instance.limit;
        const newTotal = BaseListings.instance.total;
        const newParams = BaseListings.instance.currentParams;

        if (
            arrayUtils.equals(listings, newListings)
            && loading === newLoading
            && error === newError
            && page === newPage
            && limit === newLimit
            && total === newTotal
        ) return;

        setListings(newListings);
        setLoading(newLoading);
        setError(newError || null);
        setPage(newPage);
        setLimit(newLimit);
        setTotal(newTotal);
        setCurrentParams(newParams);
    };

    const handleFiltersChange = (params: IListingsRequestParams) => {
        BaseListings.instance.applyFilters(params);
    };

    const handleResetFilters = () => {
        BaseListings.instance.resetFilters();
    };

    const handlePageChange = (newPage: number, newPageSize?: number) => {
        if (newPageSize && newPageSize !== limit) {
            BaseListings.instance.readListings({ ...currentParams, page: 1, limit: newPageSize });
        } else {
            BaseListings.instance.changePage(newPage);
        }
    };

    const handleEdit = (listingId: string) => {
        // TODO: Implement edit functionality
        console.log('Edit listing:', listingId);
    };

    const handleDelete = (listingId: string) => {
        // TODO: Implement delete functionality
        console.log('Delete listing:', listingId);
    };


    return (
        <div className={styles['listings-page']}>
            <div className={styles['listings-container']}>
                <div className={styles['listings-header']}>
                    <Title level={2}>Listings</Title>
                    <div className={styles['stats']}>
                        Total: {total} listings
                    </div>
                </div>

                <ListingsFilters
                    currentParams={currentParams}
                    onFiltersChange={handleFiltersChange}
                    onReset={handleResetFilters}
                    loading={loading}
                />

                <div className={styles['listings-content']}>
                    {error && (
                        <Alert
                            message="Loading Error"
                            description={error}
                            type="error"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    <Spin spinning={loading}>
                        {listings.length === 0 && !loading ? (
                            <Empty
                                description="No listings found"
                                className={styles['empty-state']}
                            />
                        ) : (
                            <div className={styles['listings-grid']}>
                                {listings.map((listing) => (
                                    <ListingCard
                                        key={listing.id}
                                        listing={listing}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </Spin>

                    {total > limit && (
                        <div className={styles['pagination-container']}>
                            <Pagination
                                current={page}
                                pageSize={limit}
                                total={total}
                                onChange={handlePageChange}
                                onShowSizeChange={handlePageChange}
                                showSizeChanger
                                showQuickJumper
                                showTotal={(total, range) =>
                                    `${range[0]}-${range[1]} of ${total} listings`
                                }
                                pageSizeOptions={['10', '20', '50', '100']}
                                className={styles['pagination']}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default ListingsPage;