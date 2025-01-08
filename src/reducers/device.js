import unselectDeviceIcon from '../components/menu-bar/icon--device.svg';
import arduinoUnoIcon from '../lib/libraries/devices/arduinoUno/arduinoUno-small.svg';
import arduinoNanoIcon from '../lib/libraries/devices/arduinoNano/arduinoNano-small.svg';
import FastLEDIcon from '../lib/libraries/devices/FastLED/FastLED-small.svg';
import nokia5110Icon from '../lib/libraries/devices/nokia5110/nokia5110-small.svg';
import ottoRobotIcon from '../lib/libraries/devices/ottoRobot/ottoRobot-small.svg';
import esp32Icon from '../lib/libraries/devices/esp32/esp32-small.svg';
import esp8266Icon from '../lib/libraries/devices/esp8266/esp8266-small.svg';

const iconImages = {
    'arduinoUno': arduinoUnoIcon,
    'arduinoNano': arduinoNanoIcon,
    'FastLED': FastLEDIcon,
    'nokia5110': nokia5110Icon,
    'ottoRobot': ottoRobotIcon,
    'arduinoEsp32': esp32Icon,
    'arduinoEsp8266': esp8266Icon
};

const arduinoNanoTypes = [
    { text: 'ATmega168', value: '1' },
    { text: 'ATmega328 (Old Bootloader)', value: '2' },
    { text: 'ATmega328', value: '3' },
];


const SET_ID = 'scratch-gui/device/setId';
const CLEAR_ID = 'scratch-gui/device/clearId';
const SET_NAME = 'scratch-gui/device/setName';
const CLEAR_NAME = 'scratch-gui/device/clearName';
const SET_TYPE = 'scratch-gui/device/setType';
const CLEAR_TYPE = 'scratch-gui/device/clearType';
const SET_NANO_TYPE = 'scratch-gui/device/setType';
const CLEAR_NANO_TYPE = 'scratch-gui/device/clearType';

const initialState = {
    deviceId: null,
    deviceName: null,
    deviceType: null,
    deviceIcon: unselectDeviceIcon,
    arduinoNanoType: '0'
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
        case SET_ID:
            return Object.assign({}, state, {
                deviceId: action.deviceId,
                deviceIcon: (action.deviceId) ? iconImages[action.deviceId] : unselectDeviceIcon,
                arduinoNanoType: (action.deviceId) ? action.arduinoNanoType : null,
            });
        case CLEAR_ID:
            return Object.assign({}, state, {
                deviceId: null
            });
        case SET_NAME:
            return Object.assign({}, state, {
                deviceName: action.deviceName
            });
        case CLEAR_NAME:
            return Object.assign({}, state, {
                deviceName: null
            });
        case SET_TYPE:
            return Object.assign({}, state, {
                deviceType: action.deviceType
            });
        case CLEAR_TYPE:
            return Object.assign({}, state, {
                deviceType: null
            });
        case SET_NANO_TYPE:
            return Object.assign({}, state, {
                arduinoNanoType: action.arduinoNanoType
            });
        case CLEAR_NANO_TYPE:
            return Object.assign({}, state, {
                arduinoNanoType: null
            });
        default:
            return state;
    }
};

const setDeviceId = function (deviceId) {
    return {
        type: SET_ID,
        deviceId: deviceId
    };
};

const clearDeviceId = function () {
    return {
        type: CLEAR_ID
    };
};

const setDeviceName = function (deviceName) {
    return {
        type: SET_NAME,
        deviceName: deviceName
    };
};

const clearDeviceName = function () {
    return {
        type: CLEAR_NAME
    };
};

const setDeviceType = function (deviceType) {
    return {
        type: SET_TYPE,
        deviceType: deviceType
    };
};

const clearDeviceType = function () {
    return {
        type: CLEAR_TYPE
    };
};

const setArduinoNanoType = function (arduinoNanoType) {
    return {
        type: SET_NANO_TYPE,
        arduinoNanoType: arduinoNanoType
    };
};

const clearArduinoNanoType = function () {
    return {
        type: CLEAR_NANO_TYPE
    };
};

export {
    reducer as default,
    initialState as deviceInitialState,
    arduinoNanoTypes as arduinoNanoTypes,
    setDeviceId,
    clearDeviceId,
    setDeviceName,
    clearDeviceName,
    setDeviceType,
    clearDeviceType,
    setArduinoNanoType,
    clearArduinoNanoType
};
