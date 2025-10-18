import React from "react";
import styles from "./ListingPreview.module.sass";
import { IListingDraftData } from "@/classes/listings/ListingDraft";
import { IoImageOutline } from "react-icons/io5";


interface ListingPreviewProps {
    data: IListingDraftData;
}

const ignoreListUserFields = [
    'city',
    'neighborhood',
    'address',
    'street',
    'flatNumber',
    'postalCode',
    'community',
    'province',
    'extraInfo',
];

export const ListingPreview = React.memo<ListingPreviewProps>(({ data }) => {


    const renderPhotos = () => {
        if (!data.photos) {
            return (
                <div className={styles['photos-preview']}>
                    <div className={styles['photos-preview__large-photo-container']}>
                        <IoImageOutline size={100} color="#e8e8e8" />
                    </div>
                    <div className={styles['photos-preview__small-photos-container']}>
                        <div className={styles['photos-preview__small-photo']}>
                            <IoImageOutline size={40} />
                        </div>
                        <div className={styles['photos-preview__small-photo']}>
                            <IoImageOutline size={40} />
                        </div>
                        <div className={styles['photos-preview__small-photo']}>
                            <IoImageOutline size={40} />
                        </div>
                    </div>
                </div>
            )
        };

        return (
            <>
                {data.photos.map((photo) => (
                    <div key={photo}>
                        <img src={photo} alt="photo" />
                    </div>
                ))}
            </>
        );
    };


    const renderUserFields = () => {
        const userFields = data.userFields || {};
        const userFieldsKeys = Object.keys(userFields) || [];

        const filteredUserFieldsKeys = userFieldsKeys.filter((key) => !ignoreListUserFields.includes(key));

        return (
            <>
                <div className={styles['title']}>Details</div>
                {!filteredUserFieldsKeys.length 
                    ? (
                        <div className={styles['user-fields-container']}>
                            <div className={styles['user-fields-container__item']}>
                                <div className={styles['key']}>
                                    Locali:
                                </div>
                                <div className={styles['text']}>...</div>
                            </div>
                            <div className={styles['user-fields-container__item']}>
                                <div className={styles['key']}>
                                    Bagno:
                                </div>
                                <div className={styles['text']}>...</div>
                            </div>
                            <div className={styles['user-fields-container__item']}>
                                <div className={styles['key']}>
                                    Ascensore:
                                </div>
                                <div className={styles['text']}>...</div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles['user-fields-container']}>
                            {filteredUserFieldsKeys.map((key) => (
                                <div key={key} className={styles['user-fields-container__item']}>
                                    <div className={styles['key']}>
                                        {key}:
                                    </div>
                                    <div className={styles['text']}>{userFields[key]}</div>
                                </div>
                            ))}
                        </div>
                    )
                }
            </>
        );
    };

    return (
        <div className={styles['listing-preview']}>
            <h3>Preview</h3>
            <div>
                Property type: {data.propertyType ? data.propertyType : 'no property type'}
            </div>
            <div>
                Listing type: {data.type ? data.type : 'no type'}
            </div>
            <div>
                <div>Desktop - Mobile</div>
                {/* <div>
                    <span>{"<"}</span>
                    <span>{">"}</span>
                </div> */}
            </div>
            <div className={styles['info-container']}>
                {renderPhotos()}
            </div>
            <div>
                {data.title ? data.title : 'Title'}
            </div>
            <div>
                {data.price ? data.price : '€ xxxx'}
            </div>
            <div className={styles['info-container']}>
                {renderUserFields()}
            </div>
            <div className={styles['info-container']}>
                <div className={styles['title']}>Map</div> 
            </div>
            <div className={styles['info-container']}>
                <div className={styles['title']}>Description</div> 
                <div className={styles['description']}>
                    {data.description 
                        ? (
                            <>
                                {data.description.split('\n').map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                            </>
                        ) 
                        : 'Splendida casa ...'
                    }
                </div>
            </div>
        </div>
    )
});