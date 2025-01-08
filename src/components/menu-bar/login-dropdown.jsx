/*
NOTE: this file only temporarily resides in scratch-gui.
Nearly identical code appears in scratch-www, and the two should
eventually be consolidated.
*/

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import {defineMessages} from 'react-intl';

import MenuBarMenu from './menu-bar-menu.jsx';
import styles from './login-dropdown.css';

// these are here as a hack to get them translated, so that equivalent messages will be translated
// when passed in from www via gui's renderLogin() function
const LoginDropdownMessages = defineMessages({ // eslint-disable-line no-unused-vars
    username: {
        defaultMessage: 'Username',
        description: 'Label for login username input',
        id: 'general.username'
    },
    password: {
        defaultMessage: 'Password',
        description: 'Label for login password input',
        id: 'general.password'
    },
    signin: {
        defaultMessage: 'Sign in',
        description: 'Button text for user to sign in',
        id: 'general.signIn'
    },
    signup: {
        defaultMessage: 'Sign up',
        description: 'Button text for user to sign up',
        id: 'general.signUp'
    },
    signinValidationRequired: {
        defaultMessage: 'This username and password field are required!',
        description: 'Message to tell user they must enter text in a form field',
        id: 'form.validationUsernamePasswordRequired'
    }
});


const LoginDropdown = ({
    className,
    isOpen,
    isRtl,
    onClose
}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [signValidation, setValidation] = useState(false);

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        if (!username && !password) {
            setValidation(true);
        }
        console.log(username, password,'login!');
    }

    return (
        <MenuBarMenu
            className={className}
            open={isOpen}
            // note: the Rtl styles are switched here, because this menu is justified opposite all the others
            place={isRtl ? 'right' : 'left'}
            onRequestClose={onClose}
        >
            <form onSubmit={handleLoginSubmit}>
                <div
                    className={classNames(styles.login)}
                >
                    <div>
                        <label>{LoginDropdownMessages.username.defaultMessage}</label>
                        <br></br>
                        <input
                            autoFocus
                            required
                            className={classNames(styles.inputItem)}
                            tabIndex='0'
                            type='text'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <br></br>
                    <br></br>
                    <div>
                        <label>{LoginDropdownMessages.password.defaultMessage}</label>
                        <br></br>
                        <input
                            required
                            className={classNames(styles.inputItem)}
                            tabIndex='0'
                            type='text'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                {signValidation ? (
                    <div
                        className={classNames(styles.signValidation)}
                    >
                        {LoginDropdownMessages.signinValidationRequired.defaultMessage}
                    </div>
                ) : null
                }

                <div 
                    className={classNames(styles.signGroup)}
                >
                    <div
                        className={classNames(styles.signinButton)}
                        onClick={handleLoginSubmit}
                        tabIndex='0'
                        >
                        {LoginDropdownMessages.signin.defaultMessage}
                    </div> 
                    <div
                        className={classNames(styles.signupButton)}
                        onClick={event =>  window.location.href='https://ottawastem.com/accounts/signup/'}
                        tabIndex='0'
                    >
                        {LoginDropdownMessages.signup.defaultMessage}
                    </div> 
                </div>
            </form>
        </MenuBarMenu>
    );
};

LoginDropdown.propTypes = {
    className: PropTypes.string,
    isOpen: PropTypes.bool,
    isRtl: PropTypes.bool,
    onClose: PropTypes.func
};

export default LoginDropdown;
