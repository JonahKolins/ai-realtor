import React, { useEffect, useState } from 'react';
import styles from './ListingsPage.module.sass';
import { BaseListings } from '../../classes/listings/BaseLisings';
import { IListing } from '../../api/network/listings';
import { arrayUtils } from '../../core/utils';
import { datetimeUtils } from '../../core/utils/datetimeUtils';

const ListingsPage = React.memo(() => {

    const [listings, setListings] = useState<IListing[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

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

        if (
            arrayUtils.equals(listings, newListings)
            && loading === BaseListings.instance.loading
            && error === BaseListings.instance.error
        ) return;

        setListings(newListings);
        setLoading(BaseListings.instance.loading);
        setError(BaseListings.instance.error || null);
    };


    return (
        <div className={styles['listings-page']}>
            <div className={styles['listings-container']}>
                <div className={styles['listings-header']}>
                    <h1>Listings</h1>
                </div>
                <div className={styles['listings-body']}>
                    {listings.map((listing) => (
                        <div key={listing.id} className={styles['listing-item']}>
                            <div className={styles['listing-item-header']}>
                                <div>{listing.title}</div>
                            </div>
                            <div className={styles['listing-item-body']}>
                                <div>Price:{listing.price}</div>
                                <div>Created: {datetimeUtils.formatTime(listing.createdAt, 'DD.MM.YYYY HH:mm')}</div>
                                <div>Updated: {datetimeUtils.formatTime(listing.updatedAt, 'DD.MM.YYYY HH:mm')}</div>
                                <div>Status: {listing.status}</div>
                                <div>Listing type: {listing.type}</div>
                                <div>City: {listing.userFields.city}</div>
                                <div>Floor: {listing.userFields.floor}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
})

export default ListingsPage;