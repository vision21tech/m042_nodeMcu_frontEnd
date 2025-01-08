import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import RadioButtonGroup from '../radio-button/radio-button.jsx';

import Box from '../box/box.jsx';
import Dots from './dots.jsx';
import bluetoothIcon from './icons/bluetooth-white.svg';
import usbIcon from './icons/usb-white.svg';
import styles from './connection-modal.css';
import classNames from 'classnames';
import { arduinoNanoTypes } from '../../reducers/device.js';

const ConnectedStep = props => (
    <Box className={styles.body}>
        <Box className={styles.activityArea}>
            <Box className={styles.centeredRow}>
                <div className={styles.peripheralActivity}>
                    <img
                        className={styles.peripheralActivityIcon}
                        src={props.connectionIconURL}
                    />
                    {props.isSerialport ? (
                        <img
                            className={styles.bluetoothConnectingIcon}
                            src={usbIcon}
                        />) :
                        (
                            <img
                                className={styles.bluetoothConnectingIcon}
                                src={bluetoothIcon}
                            />)}
                </div>
            </Box>
        </Box>
        <Box className={styles.bottomArea}>
            <Box className={classNames(styles.bottomAreaItem, styles.instructions)}>
                <FormattedMessage
                    defaultMessage='Device Connected'
                    description='Message indicating that a device was connected'
                    id='gui.connection.deviceConnected'
                />
            </Box>
            {(props.deviceType === 'arduinoNano') ? (
                <Box className={classNames(styles.bottomAreaItem, styles.instructions)}>
                    <FormattedMessage
                        defaultMessage='Select Arduino Nano Board Type:'
                        description='Message indicating select Arduino Nano Board Type'
                        id='gui.connection.selectNanoBoard'
                    />
                    <RadioButtonGroup listOfItems={arduinoNanoTypes} defaultValue={'0'} selectedItemCallback={props.onSelectArduinoNanoType}/>
                </Box>
            ) : null}
            <Dots
                success
                className={styles.bottomAreaItem}
                total={3}
            />
            <div className={classNames(styles.bottomAreaItem, styles.cornerButtons)}>
                <button
                    className={classNames(styles.redButton, styles.connectionButton)}
                    onClick={props.onDisconnect}
                >
                    <FormattedMessage
                        defaultMessage='Device Disconnect'
                        description='Button to disconnect the device'
                        id='gui.connection.disconnect'
                    />
                </button>
                {((props.deviceType==='arduinoNano' && props.arduinoNanoType!=='0') || (props.deviceType!='arduinoNano')) ? (
                    <button
                        className={styles.connectionButton}
                        onClick={props.onCancel}
                    >
                        <FormattedMessage
                            defaultMessage='Go to Editor'
                            description='Button to return to the editor'
                            id='gui.connection.go-to-editor'
                        />
                    </button>
                ) : null}
            </div>
        </Box>
    </Box>
);

ConnectedStep.propTypes = {
    connectionIconURL: PropTypes.string.isRequired,
    deviceType: PropTypes.string.isRequired,
    isSerialport: PropTypes.bool,
    onCancel: PropTypes.func,
    onDisconnect: PropTypes.func,
    defaultValue: PropTypes.string,
    arduinoNanoType: PropTypes.string,
    onSelectArduinoNanoType: PropTypes.func.isRequired
};

export default ConnectedStep;
