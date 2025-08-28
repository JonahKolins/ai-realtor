import React, {memo, useMemo} from 'react';
import styles from "./Header.module.sass";
import {Link, useLocation, useNavigate} from "react-router-dom";
import Button from "../../designSystem/button/Button";
import { Dropdown, MenuProps } from "antd";
import { BsBoxes } from "react-icons/bs";
import { IoBedOutline, IoHomeOutline } from "react-icons/io5";

interface HeaderProps {}

const Header = memo<HeaderProps>(() => {
	const location = useLocation();
	const navigate = useNavigate();

	const isLoginPages = useMemo(() => {
		return location.pathname === '/login' || location.pathname === '/register';
	}, [location])

	const handleSignIn = () => {
		navigate('/login')
	}

	const handleRegister = () => {
		navigate('/register')
	}

	const handleOpenDropDown = () => {

	}

	const serviceDropdownItem = (icon: JSX.Element, caption: string, text: string, onClick?: () => void) => {
		return (
			<div onClick={onClick} className={styles['service-dropdown-item']}>
				<div className={styles['icon-container']}>{icon}</div>
				<div className={styles['content']}>
					<div className={styles['caption']}>{caption}</div>
					<div className={styles['text']}>{text}</div>
				</div>
			</div>
		)
	}

	// @ts-ignore
	const services = useMemo<MenuProps["items"]>(() => {
		return [
			{
				label: serviceDropdownItem(
					<IoHomeOutline size={22} />,
					'New Listing',
					'Create a new listing',
					() => { navigate('/create')}
				),
				key: '1',
			},
			{
				label: serviceDropdownItem(
					<IoHomeOutline size={22} />,
					'Listings',
					'View all listings',
					() => { navigate('/listings')}
				),
				key: '2',
			},
		]
	}, [])

	return (
		<header className={styles['header']}>
			<div className={styles['header-container']}>
				<div className={styles['header-body']}>
					<div className={styles['content']}>
						<Link to={'/'} className={styles['logo']}>
							<BsBoxes size={22} className={styles['company-icon']} />
						</Link>
						{!isLoginPages && (
							<div className={styles['auth-container']}>
								<>
									<Button
										className={styles['sign-in-button']}
										onClick={handleSignIn}
									>
										Log In
									</Button>
									<Button
										className={styles['reg-button']}
										onClick={handleRegister}
									>
										Registration
									</Button>
								</>
							</div>
						)}
					</div>
					<div className={styles['navigation']}>
						<Dropdown
							onOpenChange={handleOpenDropDown}
							menu={{
								items: services,
							}}
							trigger={['hover']}
							autoAdjustOverflow
							placement='bottomLeft'
							rootClassName={styles['drop-link']} //not work
						>
							<Link to="/services" className={styles['item']}>Services</Link>
						</Dropdown>
						<Link to="/about" className={styles['item']}>About</Link>
						<Link to="/contacts" className={styles['item']}>Contacts</Link>
					</div>
				</div>
			</div>
		</header>
	)
})

export default Header;
