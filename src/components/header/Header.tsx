import React, {memo, useMemo, useState} from 'react';
import styles from "./Header.module.sass";
import {Link, useLocation, useNavigate} from "react-router-dom";
import Button from "../../designSystem/button/Button";
import { Dropdown, MenuProps } from "antd";
import { BsBoxes } from "react-icons/bs";
import { IoBedOutline, IoHomeOutline, IoLayersOutline } from "react-icons/io5";
import { useAuth } from "../../contexts/AuthContext";
import AuthModal from "../auth/AuthModal/AuthModal";

interface HeaderProps {}

const Header = memo<HeaderProps>(() => {
	const location = useLocation();
	const navigate = useNavigate();
	const { isAuthenticated, user, logout, logoutAll } = useAuth();
	const [authModalOpen, setAuthModalOpen] = useState(false);
	const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

	const handleSignIn = () => {
		setAuthModalMode('login');
		setAuthModalOpen(true);
	}

	const handleRegister = () => {
		setAuthModalMode('register');
		setAuthModalOpen(true);
	}

	const handleLogout = async () => {
		await logout();
	}

	const handleLogoutAll = async () => {
		await logoutAll();
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
					() => { navigate('/services/create')}
				),
				key: '1',
			},
			{
				label: serviceDropdownItem(
					<IoLayersOutline size={22} />,
					'Listings',
					'View all listings',
					() => { navigate('/services/listings')}
				),
				key: '2',
			},
            {
				label: serviceDropdownItem(
					<IoLayersOutline size={22} />,
					'Photos',
					'Edit photos of listings',
					() => { navigate('/services/edit-photos')}
				),
				key: '3',
			},
		]
	}, [navigate])

	// Меню пользователя для авторизованных пользователей
	const userMenu = useMemo<MenuProps["items"]>(() => {
		return [
			{
				label: (
					<div onClick={handleLogout} style={{ padding: '8px 0' }}>
						Выйти
					</div>
				),
				key: 'logout',
			},
			{
				label: (
					<div onClick={handleLogoutAll} style={{ padding: '8px 0' }}>
						Выйти со всех устройств
					</div>
				),
				key: 'logout-all',
			},
		]
	}, [handleLogout, handleLogoutAll])

	return (
		<header className={styles['header']}>
			<div className={styles['header-container']}>
				<div className={styles['header-body']}>
					<div className={styles['content']}>
						<Link to={'/'} className={styles['logo']}>
							<BsBoxes size={22} className={styles['company-icon']} />
						</Link>
						<div className={styles['auth-container']}>
							{isAuthenticated ? (
								<>
									<span style={{ marginRight: '1rem', color: '#666' }}>
										{user?.email}
									</span>
									<Dropdown
										menu={{ items: userMenu }}
										trigger={['click']}
										placement="bottomRight"
									>
										<Button 
											className={styles['user-menu-button']}
											onClick={() => {}} // Пустой обработчик для Dropdown
										>
											Аккаунт
										</Button>
									</Dropdown>
								</>
							) : (
								<>
									<Button
										className={styles['sign-in-button']}
										onClick={handleSignIn}
									>
										Вход
									</Button>
									<Button
										className={styles['reg-button']}
										onClick={handleRegister}
									>
										Регистрация
									</Button>
								</>
							)}
						</div>
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
							<div className={styles['item']} onClick={() => { navigate('/services')}}>Services</div>
						</Dropdown>
						<Link to="/about" className={styles['item']}>About</Link>
						<Link to="/contacts" className={styles['item']}>Contacts</Link>
					</div>
				</div>
			</div>
			
			{/* Модальное окно аутентификации */}
			<AuthModal
				isOpen={authModalOpen}
				onClose={() => setAuthModalOpen(false)}
				initialMode={authModalMode}
			/>
		</header>
	)
})

export default Header;
