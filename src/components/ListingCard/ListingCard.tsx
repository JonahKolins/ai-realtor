import React from 'react';
import { Dropdown, Button } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, PictureOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { IListing, ListingStatus, ListingType } from '../../api/network/listings';
import { datetimeUtils } from '../../core/utils/datetimeUtils';
import styles from './ListingCard.module.sass';

interface ListingCardProps {
    listing: IListing;
    onEdit?: (listingId: string) => void;
    onDelete?: (listingId: string) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, onEdit, onDelete }) => {
    const getStatusText = (status: ListingStatus) => {
        switch (status) {
            case 'draft':
                return 'Draft';
            case 'ready':
                return 'Published';
            case 'archived':
                return 'Archived';
            default:
                return status;
        }
    };

    const getTypeText = (type: ListingType) => {
        switch (type) {
            case 'sale':
                return 'Sale';
            case 'rent':
                return 'Rent';
            default:
                return type;
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const items: MenuProps['items'] = [
        {
            key: 'edit',
            label: 'Edit',
            icon: <EditOutlined />,
            onClick: () => onEdit?.(listing.id),
        },
        {
            key: 'delete',
            label: 'Delete',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => onDelete?.(listing.id),
        },
    ];

    const generateSummary = () => {
        const { userFields } = listing;
        const parts = [];
        
        if (userFields?.city) parts.push(userFields.city);
        if (userFields?.district) parts.push(userFields.district);
        if (userFields?.floor) parts.push(`Floor ${userFields.floor}`);
        if (userFields?.balcony) parts.push('balcony');
        if (userFields?.parking) parts.push('parking');

        return parts.join(', ') || 'Details in description';
    };

    return (
        <div className={styles['listing-card']}>
            <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
                <Button
                    type="text"
                    icon={<MoreOutlined />}
                    className={styles['actions-button']}
                />
            </Dropdown>

            <div className={styles['card-content']}>
                <div className={styles['image-placeholder']}>
                    <div className={styles['placeholder-icon']}>
                        <PictureOutlined />
                    </div>
                </div>
                
                <div className={styles['listing-info']}>
                    <div className={styles['title']}>
                        {listing.title || <span className={styles['no-title']}>No title</span>}
                    </div>

                    <div className={styles['tags']}>
                        <span className={styles['status-tag']}>
                            {getStatusText(listing.status)}
                        </span>
                        <span className={styles['type-tag']}>
                            {getTypeText(listing.type)}
                        </span>
                    </div>

                    <div className={styles['summary']}>
                        {generateSummary()}
                    </div>

                    <div className={styles['details']}>
                        <div className={styles['price']}>
                            {formatPrice(listing.price)}
                        </div>
                        
                        <div className={styles['date']}>
                            Created: {datetimeUtils.formatTime(listing.createdAt, 'DD.MM.YYYY')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingCard;
