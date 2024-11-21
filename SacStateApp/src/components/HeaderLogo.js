import React from 'react';
import { Image } from 'react-native';
import styles from '../styles/DashboardStyles';
import logo from '../assets/sac-state-logo.png';

const HeaderLogo = () => <Image source={logo} style={styles.logo} />;

export default HeaderLogo;
