import classNames from 'classnames';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import bowser from 'bowser';
import React from 'react';
import ReactTooltip from 'react-tooltip';

import VM from 'scratch-arduino-vm';

import Box from '../box/box.jsx';
import Button from '../button/button.jsx';
import CommunityButton from './community-button.jsx'; // eslint-disable-line no-unused-vars
import ShareButton from './share-button.jsx'; // eslint-disable-line no-unused-vars
import {ComingSoonTooltip} from '../coming-soon/coming-soon.jsx';
import Divider from '../divider/divider.jsx';
import LanguageSelector from '../../containers/language-selector.jsx';
import SaveStatus from './save-status.jsx'; // eslint-disable-line no-unused-vars
import ProjectWatcher from '../../containers/project-watcher.jsx'; // eslint-disable-line no-unused-vars
import MenuBarMenu from './menu-bar-menu.jsx';
import {MenuItem, MenuSection} from '../menu/menu.jsx';
import ProjectTitleInput from './project-title-input.jsx';
import AuthorInfo from './author-info.jsx';
import AccountNav from '../../containers/account-nav.jsx'; // eslint-disable-line no-unused-vars
import LoginDropdown from './login-dropdown.jsx'; // eslint-disable-line no-unused-vars
import SB3Downloader from '../../containers/sb3-downloader.jsx';
import DeletionRestorer from '../../containers/deletion-restorer.jsx'; 
import TurboMode from '../../containers/turbo-mode.jsx';
import MenuBarHOC from '../../containers/menu-bar-hoc.jsx';
import {isScratchDesktop} from '../../lib/isScratchDesktop';

import {
    openTipsLibrary,
    openUploadProgress,
    openUpdateModal,
    openConnectionModal,
    openDeviceLibrary
} from '../../reducers/modals';
import {setPlayer} from '../../reducers/mode';
import {
    autoUpdateProject,
    getIsUpdating,
    getIsShowingProject,
    manualUpdateProject,
    requestNewProject,
    remixProject,
    saveProjectAsCopy
} from '../../reducers/project-state';
import {
    openAboutMenu,
    closeAboutMenu,
    aboutMenuOpen,    
    openAccountMenu,
    closeAccountMenu,
    accountMenuOpen,
    openFileMenu,
    closeFileMenu,
    fileMenuOpen,
    openEditMenu,
    closeEditMenu,
    editMenuOpen,
    openSettingMenu,
    closeSettingMenu,
    settingMenuOpen,
    openLanguageMenu,
    closeLanguageMenu,
    languageMenuOpen,
    openLoginMenu,
    closeLoginMenu,
    loginMenuOpen,
    setLinkStatus,
} from '../../reducers/menus';
import {setStageSize} from '../../reducers/stage-size';
import {setUploadMode, setRealtimeMode} from '../../reducers/program-mode';
import {setRealtimeConnection, clearConnectionModalPeripheralName} from '../../reducers/connection-modal';
import {setUpdate} from '../../reducers/update';
import {STAGE_SIZE_MODES} from '../../lib/layout-constants';

import collectMetadata from '../../lib/collect-metadata';

import styles from './menu-bar.css';

import helpIcon from '../../lib/assets/icon--tutorials.svg';
import mystuffIcon from './icon--mystuff.png'; // eslint-disable-line no-unused-vars
import profileIcon from './icon--profile.png'; // eslint-disable-line no-unused-vars
import remixIcon from './icon--remix.svg';
import dropdownCaret from './dropdown-caret.svg';
import languageIcon from '../language-selector/language-icon.svg';
import aboutIcon from './icon--about.svg';
import linkSocketIcon from './icon--link-socket.svg'; // eslint-disable-line no-unused-vars

import scratchLogo from './scratch-logo.svg';

import sharedMessages from '../../lib/shared-messages';

import Switch from 'react-switch';

import linkConnectedIcon from './icon--link-connected.svg';
import linkDisconnectedIcon from './icon--link-disconnected.svg';
import disconnectedIcon from './icon--disconnected.svg';
import connectedIcon from './icon--connected.svg';
import fileIcon from './icon--file.svg';
import screenshotIcon from './icon--screenshot.svg';
import settingIcon from './icon--setting.svg';

import downloadFirmwareIcon from './icon--download-firmware.svg';
import saveSvgAsPng from 'openblock-save-svg-as-png';
import {showAlertWithTimeout} from '../../reducers/alerts';

import arduinoBoardIcon from './icon--arduino-board.svg';
import uploadFirmware from './icon--upload-firmware.svg';

const ariaMessages = defineMessages({
    language: {
        id: 'gui.menuBar.LanguageSelector',
        defaultMessage: 'language selector',
        description: 'accessibility text for the language selection menu'
    },
    tutorials: {
        id: 'gui.menuBar.tutorialsLibrary',
        defaultMessage: 'Tutorials',
        description: 'accessibility text for the tutorials button'
    }
});

const MenuBarItemTooltip = ({
    children,
    className,
    enable,
    id,
    place = 'bottom'
}) => {
    if (enable) {
        return (
            <React.Fragment>
                {children}
            </React.Fragment>
        );
    }
    return (
        <ComingSoonTooltip
            className={classNames(styles.comingSoon, className)}
            place={place}
            tooltipClassName={styles.comingSoonTooltip}
            tooltipId={id}
        >
            {children}
        </ComingSoonTooltip>
    );
};

MenuBarItemTooltip.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    enable: PropTypes.bool,
    id: PropTypes.string,
    place: PropTypes.oneOf(['top', 'bottom', 'left', 'right'])
};

const MenuItemTooltip = ({id, isRtl, children, className}) => (
    <ComingSoonTooltip
        className={classNames(styles.comingSoon, className)}
        isRtl={isRtl}
        place={isRtl ? 'left' : 'right'}
        tooltipClassName={styles.comingSoonTooltip}
        tooltipId={id}
    >
        {children}
    </ComingSoonTooltip>
);

MenuItemTooltip.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    id: PropTypes.string,
    isRtl: PropTypes.bool
};

const AboutButton = props => (
    <Button
        className={classNames(styles.menuBarItem, styles.hoverable)}
        iconClassName={styles.aboutIcon}
        iconSrc={aboutIcon}
        onClick={props.onClick}
    />
);

AboutButton.propTypes = {
    onClick: PropTypes.func.isRequired
};

class MenuBar extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleClickNew',
            'handleClickRemix',
            'handleClickSave',
            'handleClickSaveAsCopy',
            'handleClickSeeCommunity',
            'handleClickShare',
            'handleKeyPress',
            'handleLanguageMouseUp',
            'handleRestoreOption',
            'getSaveToComputerHandler',
            'restoreOptionMessage',
            'handleConnectionMouseUp',
            'handleDownloadFirmware',
            'handleSelectDeviceMouseUp',
            'handleProgramModeSwitchOnChange',
            'handleProgramModeUpdate',
            'handleScreenshot',
            'handleCheckUpdate',
            'handleClearCache'
        ]);
    }
    componentDidMount () {
        document.addEventListener('keydown', this.handleKeyPress);
        this.props.vm.on('LINK_CONNECTED', this.props.onLinkConnected);
        this.props.vm.on('LINK_DISCONNECTED', this.props.onLinkDisconnected);
        this.props.vm.on('PERIPHERAL_DISCONNECTED', this.props.onDisconnect);
        this.props.vm.on('PROGRAM_MODE_UPDATE', this.handleProgramModeUpdate); 
    }
    componentWillUnmount () {
        document.removeEventListener('keydown', this.handleKeyPress);
        this.props.vm.removeListener('PERIPHERAL_DISCONNECTED', this.props.onDisconnect);
        this.props.vm.removeListener('PROGRAM_MODE_UPDATE', this.handleProgramModeUpdate);
    }    
    handleClickNew () {
        // if the project is dirty, and user owns the project, we will autosave.
        // but if they are not logged in and can't save, user should consider
        // downloading or logging in first.
        // Note that if user is logged in and editing someone else's project,
        // they'll lose their work.
        const readyToReplaceProject = this.props.confirmReadyToReplaceProject(
            this.props.intl.formatMessage(sharedMessages.replaceProjectWarning)
        );
        this.props.onRequestCloseFile();
        if (readyToReplaceProject) {
            this.props.onClickNew(this.props.canSave && this.props.canCreateNew);
        }
        this.props.onRequestCloseFile();
    }
    handleClickRemix () {
        this.props.onClickRemix();
        this.props.onRequestCloseFile();
    }
    handleClickSave () {
        this.props.onClickSave();
        this.props.onRequestCloseFile();
    }
    handleClickSaveAsCopy () {
        this.props.onClickSaveAsCopy();
        this.props.onRequestCloseFile();
    }
    handleClickSeeCommunity (waitForUpdate) {
        if (this.props.shouldSaveBeforeTransition()) {
            this.props.autoUpdateProject(); // save before transitioning to project page
            waitForUpdate(true); // queue the transition to project page
        } else {
            waitForUpdate(false); // immediately transition to project page
        }
    }
    handleClickShare (waitForUpdate) {
        if (!this.props.isShared) {
            if (this.props.canShare) { // save before transitioning to project page
                this.props.onShare();
            }
            if (this.props.canSave) { // save before transitioning to project page
                this.props.autoUpdateProject();
                waitForUpdate(true); // queue the transition to project page
            } else {
                waitForUpdate(false); // immediately transition to project page
            }
        }
    }
    handleRestoreOption (restoreFun) {
        return () => {
            restoreFun();
            this.props.onRequestCloseEdit();
        };
    }
    handleKeyPress (event) {
        const modifier = bowser.mac ? event.metaKey : event.ctrlKey;
        if (modifier && event.key === 's') {
            this.props.onClickSave();
            event.preventDefault();
        }
    }
    getSaveToComputerHandler (downloadProjectCallback) {
        return () => {
            this.props.onRequestCloseFile();
            downloadProjectCallback();
            if (this.props.onProjectTelemetryEvent) {
                const metadata = collectMetadata(this.props.vm, this.props.projectTitle, this.props.locale);
                this.props.onProjectTelemetryEvent('projectDidSave', metadata);
            }
        };
    }
    handleLanguageMouseUp (e) {
        if (!this.props.languageMenuOpen) {
            this.props.onClickLanguage(e);
        }
    }
    restoreOptionMessage (deletedItem) {
        switch (deletedItem) {
        case 'Sprite':
            return (<FormattedMessage
                defaultMessage="Restore Sprite"
                description="Menu bar item for restoring the last deleted sprite."
                id="gui.menuBar.restoreSprite"
            />);
        case 'Sound':
            return (<FormattedMessage
                defaultMessage="Restore Sound"
                description="Menu bar item for restoring the last deleted sound."
                id="gui.menuBar.restoreSound"
            />);
        case 'Costume':
            return (<FormattedMessage
                defaultMessage="Restore Costume"
                description="Menu bar item for restoring the last deleted costume."
                id="gui.menuBar.restoreCostume"
            />);
        default: {
            return (<FormattedMessage
                defaultMessage="Restore"
                description="Menu bar item for restoring the last deleted item in its disabled state." /* eslint-disable-line max-len */
                id="gui.menuBar.restore"
            />);
        }
        }
    }
    handleConnectionMouseUp () {
        if (this.props.deviceId) {
            this.props.onOpenConnectionModal();
        } else {
            this.props.onDeviceIsEmpty();
        }
    }
    handleSelectDeviceMouseUp () {
        const blocks = document.querySelector('.blocklyWorkspace .blocklyBlockCanvas');
        if (blocks.getBBox().height === 0) {
            this.props.onOpenDeviceLibrary();
        } else {
            this.props.onWorkspaceIsNotEmpty();
        }
    }
    handleProgramModeSwitchOnChange () {
        if (this.props.isRealtimeMode) {
            this.props.vm.runtime.setRealtimeMode(false);
        } else {
            /**
             * The realtime stage framwork didn't support STAGE_SIZE_MODES.hide,
             * so if the mode is hide switch to large mode.
             *  */
            if (this.props.stageSizeMode === STAGE_SIZE_MODES.hide) {
                this.props.onSetStageLarge();
            }
            this.props.vm.runtime.setRealtimeMode(true);
        }
    }
    handleProgramModeUpdate (data) {
        if (data.isRealtimeMode) {
            this.props.onSetRealtimeMode();
        } else {
            this.props.onSetUploadMode();
        }
    }
    handleDownloadFirmware () {
        if (this.props.deviceId) {
            this.props.vm.uploadFirmwareToPeripheral(this.props.deviceId);
            this.props.onSetRealtimeConnection(false);
            this.props.onOpenUploadProgress();
        } else {
            this.props.onNoPeripheralIsConnected();
        }
    }
    handleScreenshot () {
        const blocks = document.querySelector('.blocklyWorkspace .blocklyBlockCanvas');
        if (blocks.getBBox().height === 0) {
            this.props.onWorkspaceIsEmpty();
        } else {
            const transform = blocks.getAttribute('transform');
            const scale = parseFloat(transform.substring(transform.indexOf('scale') + 6, transform.length - 1));
            const data = new Date();

            saveSvgAsPng.saveSvgAsPng(blocks, `${this.props.projectTitle}-${data.getTime()}.png`, {
                left: blocks.getBBox().x * scale,
                top: blocks.getBBox().y * scale,
                height: blocks.getBBox().height * scale,
                width: blocks.getBBox().width * scale,
                scale: 2 / scale,
                encoderOptions: 1
            });
        }
    }
    handleCheckUpdate () {
        this.props.onSetUpdate({phase: 'checking'});
        this.props.onClickCheckUpdate();
    }
    handleClearCache () {
        const readyClearCache = this.props.confirmClearCache(
            this.props.intl.formatMessage(sharedMessages.clearCacheWarning)
        );
        if (readyClearCache) {
            this.props.onClickClearCache();
        }
    }
    buildAboutMenu (onClickAbout) {
        if (!onClickAbout) {
            // hide the button
            return null;
        }
        if (typeof onClickAbout === 'function') {
            // make a button which calls a function
            return <AboutButton onClick={onClickAbout} />;
        }
        // assume it's an array of objects
        // each item must have a 'title' FormattedMessage and a 'handleClick' function
        // generate a menu with items for each object in the array
        return (
            <div
                className={classNames(styles.menuBarItem, styles.hoverable, {
                    [styles.active]: this.props.aboutMenuOpen
                })}
                onMouseUp={this.props.onRequestOpenAbout}
            >
                <img
                    className={styles.aboutIcon}
                    src={aboutIcon}
                />
                <MenuBarMenu
                    className={classNames(styles.menuBarMenu)}
                    open={this.props.aboutMenuOpen}
                    place={this.props.isRtl ? 'right' : 'left'}
                    onRequestClose={this.props.onRequestCloseAbout}
                >
                    {
                        onClickAbout.map(itemProps => (
                            <MenuItem
                                key={itemProps.title}
                                isRtl={this.props.isRtl}
                                onClick={this.wrapAboutMenuCallback(itemProps.onClick)}
                            >
                                {itemProps.title}
                            </MenuItem>
                        ))
                    }
                </MenuBarMenu>
            </div>
        );
    }
    wrapAboutMenuCallback (callback) {
        return () => {
            callback();
            this.props.onRequestCloseAbout();
        };
    }    
    render () {
        const saveNowMessage = (
            <FormattedMessage
                defaultMessage="Save now"
                description="Menu bar item for saving now"
                id="gui.menuBar.saveNow"
            />
        );
        const createCopyMessage = (
            <FormattedMessage
                defaultMessage="Save as a copy"
                description="Menu bar item for saving as a copy"
                id="gui.menuBar.saveAsCopy"
            />
        );
        const remixMessage = (
            <FormattedMessage
                defaultMessage="Remix"
                description="Menu bar item for remixing"
                id="gui.menuBar.remix"
            />
        );
        const newProjectMessage = (
            <FormattedMessage
                defaultMessage="New"
                description="Menu bar item for creating a new project"
                id="gui.menuBar.new"
            />
        );
        const checkUpdate = (
            <FormattedMessage
                defaultMessage="Check update"
                description="Menu bar item for check update"
                id="gui.menuBar.checkUpdate"
            />
        );
        const installDriver = (
            <FormattedMessage
                defaultMessage="Install driver"
                description="Menu bar item for install drivers"
                id="gui.menuBar.installDriver"
            />
        );
        const clearCache = (
            <FormattedMessage
                defaultMessage="Clear cache and restart"
                description="Menu bar item for clear cache and restart"
                id="gui.menuBar.clearCacheAndRestart"
            />
        );
        // eslint-disable-next-line no-unused-vars
        const remixButton = (
            <Button
                className={classNames(
                    styles.menuBarButton,
                    styles.remixButton
                )}
                iconClassName={styles.remixButtonIcon}
                iconSrc={remixIcon}
                onClick={this.handleClickRemix}
            >
                {remixMessage}
            </Button>
        );
        // Show the About button only if we have a handler for it (like in the desktop app)
        const aboutButton = this.buildAboutMenu(this.props.onClickAbout);
        return (
            <Box
                className={classNames(
                    this.props.className,
                    styles.menuBar
                )}
            >
                <div className={styles.mainMenu}>
                    <div className={classNames(styles.menuBarItem)}>
                        <img
                            alt="Ottawa STEM Club"
                            className={classNames(styles.scratchLogo, {
                                [styles.clickable]: typeof this.props.onClickLogo !== 'undefined'
                            })}
                            draggable={false}
                            src={this.props.logo}
                            onClick={this.props.onClickLogo}
                        />
                    </div>
                    {/* {(this.props.canChangeLanguage) && (<div
                        className={classNames(styles.menuBarItem, styles.hoverable, styles.languageMenu)}
                    >
                        <div>
                            <img
                                className={styles.languageIcon}
                                src={languageIcon}
                            />
                            <img
                                className={styles.languageCaret}
                                src={dropdownCaret}
                            />
                        </div>
                        <LanguageSelector label={this.props.intl.formatMessage(ariaMessages.language)} />
                    </div>)} */}
                    {(this.props.canManageFiles) && (
                        <div
                            className={classNames(styles.menuBarItem, styles.hoverable, {
                                [styles.active]: this.props.fileMenuOpen
                            })}
                            onMouseUp={this.props.onClickFile}
                        >
                            <img
                                className={styles.fileIcon}
                                src={fileIcon}
                            />
                            <FormattedMessage
                                defaultMessage="File"
                                description="Text for file dropdown menu"
                                id="gui.menuBar.file"
                            />
                            <MenuBarMenu
                                className={classNames(styles.menuBarMenu)}
                                open={this.props.fileMenuOpen}
                                place={this.props.isRtl ? 'left' : 'right'}
                                onRequestClose={this.props.onRequestCloseFile}
                            >
                                <MenuSection>
                                    <MenuItem
                                        isRtl={this.props.isRtl}
                                        onClick={this.handleClickNew}
                                    >
                                        {newProjectMessage}
                                    </MenuItem>
                                </MenuSection>
                                {(this.props.canSave || this.props.canCreateCopy || this.props.canRemix) && (
                                    <MenuSection>
                                        {this.props.canSave && (
                                            <MenuItem onClick={this.handleClickSave}>
                                                {saveNowMessage}
                                            </MenuItem>
                                        )}
                                        {this.props.canCreateCopy && (
                                            <MenuItem onClick={this.handleClickSaveAsCopy}>
                                                {createCopyMessage}
                                            </MenuItem>
                                        )}
                                        {this.props.canRemix && (
                                            <MenuItem onClick={this.handleClickRemix}>
                                                {remixMessage}
                                            </MenuItem>
                                        )}
                                    </MenuSection>
                                )}
                                <MenuSection>
                                    <MenuItem
                                        onClick={this.props.onStartSelectingFileUpload}
                                    >
                                        {this.props.intl.formatMessage(sharedMessages.loadFromComputerTitle)}
                                    </MenuItem>                                    
                                    <SB3Downloader>{(className, downloadProjectCallback) => (
                                        <MenuItem
                                            className={className}
                                            onClick={this.getSaveToComputerHandler(downloadProjectCallback)}
                                        >
                                            <FormattedMessage
                                                defaultMessage="Save to your computer"
                                                description="Menu bar item for downloading a project to your computer" // eslint-disable-line max-len
                                                id="gui.menuBar.downloadToComputer"
                                            />
                                        </MenuItem>
                                    )}</SB3Downloader>
                                </MenuSection>
                            </MenuBarMenu>
                        </div>
                    )}
                    <Divider className={classNames(styles.divider)} />
                    {/* <div
                        aria-label={this.props.intl.formatMessage(ariaMessages.tutorials)}
                        className={classNames(styles.menuBarItem, styles.hoverable)}
                        onClick={this.props.onOpenTipLibrary}
                    >
                        <img
                            className={styles.helpIcon}
                            src={helpIcon}
                        />
                        <FormattedMessage {...ariaMessages.tutorials} />
                    </div> */}
                    {/* <Divider className={classNames(styles.divider)} /> */}
                    {this.props.canEditTitle ? (
                        <div className={classNames(styles.menuBarItem, styles.growable)}>
                            <MenuBarItemTooltip
                                enable
                                id="title-field"
                            >
                                <ProjectTitleInput
                                    className={classNames(styles.titleFieldGrowable)}
                                />
                            </MenuBarItemTooltip>
                        </div>
                    ) : ((this.props.authorUsername && this.props.authorUsername !== this.props.username) ? (
                        <AuthorInfo
                            className={styles.authorInfo}
                            imageUrl={this.props.authorThumbnailUrl}
                            projectTitle={this.props.projectTitle}
                            userId={this.props.authorId}
                            username={this.props.authorUsername}
                        />
                    ) : null)}
                    {/* <div className={classNames(styles.menuBarItem)}>
                        {this.props.canRemix ? remixButton : []}
                    </div>                     */}
                    <Divider className={classNames(styles.divider)} />  {/* Device management */}
                    {this.props.linkStatus ? (
                        <div
                            className={classNames(styles.menuBarItem, styles.hoverable)}
                            data-tip="tooltip"
                            data-for="linkConnectedTip"
                        >
                            <img
                                className={styles.disableHover}
                                src={linkConnectedIcon}
                            />
                            <ReactTooltip
                                className={styles.successTooltip}
                                id="linkConnectedTip"
                                place="bottom"
                                effect="solid"
                            >
                                <FormattedMessage
                                    defaultMessage="Scratch Arduino Link is connected"
                                    description="Tooltip for menubar Scratch Arduino Link connected icon"
                                    id="gui.menuBar.linkConnectedTooltip"
                                />
                            </ReactTooltip>
                        </div>
                    ) : (
                        <div
                            className={classNames(styles.menuBarItem, styles.hoverable)}
                            data-tip="tooltip"
                            data-for="linkDisconnectedTip"
                            onClick={this.props.onClickLinkLogo}
                        >
                            <img
                                className={styles.disableHover}
                                src={linkDisconnectedIcon}
                            />
                            <ReactTooltip
                                className={styles.warningTooltip}
                                id="linkDisconnectedTip"
                                place="bottom"
                                effect="solid"
                            >
                                <FormattedMessage
                                    defaultMessage="Scratch Arduino Link is not installed or running!"
                                    description="Tooltip for menubar Scratch Arduino Link disconnected icon"
                                    id="gui.menuBar.linkDisconnectedTooltip"
                                />
                            </ReactTooltip>
                        </div>                    
                    )}
                    <div
                        className={classNames(styles.menuBarItem, styles.hoverable)}
                        data-tip="tooltip"
                        data-for="selectDeviceTip"
                        onClick={this.handleSelectDeviceMouseUp}
                    >
                        <img
                            className={styles.helpIcon}
                            src={this.props.deviceIcon}
                        />
                        {this.props.deviceName ? (
                            <div>
                                {this.props.deviceName}
                            </div>
                        ) : (
                            <FormattedMessage
                                defaultMessage="No device selected"
                                description="Text for menubar device select button"
                                id="gui.menuBar.noDeviceSelected"
                            />
                        )} 
                        <ReactTooltip
                            className={styles.selectDeviceTooltip}
                            id="selectDeviceTip"
                            place="bottom"
                            effect="solid"
                        >
                            <FormattedMessage
                                defaultMessage="Select device"
                                description="Text for menubar device select button tooltip"
                                id="gui.menuBar.deviceSelectTooltip"
                            />
                        </ReactTooltip>
                    </div>
                    {this.props.peripheralName ? (
                        <div
                            className={classNames(styles.menuBarItem, styles.hoverable)}
                            data-tip="tooltip"
                            data-for="deviceConnectedTip"
                        >
                            <img
                                className={styles.disableHover}
                                src={connectedIcon}
                            />
                            <ReactTooltip
                                className={styles.successTooltip}
                                id="deviceConnectedTip"
                                place="bottom"
                                effect="solid"
                            >
                                <FormattedMessage
                                    defaultMessage="Device is connected"
                                    description="Device is connected"
                                    id="gui.menuBar.deviceConnected"
                                />
                            </ReactTooltip>
                        </div>
                    ) : (
                        <div
                            className={classNames(styles.menuBarItem, styles.hoverable)}
                            data-tip="tooltip"
                            data-for="deviceDisconnectedTip"
                            onClick={this.handleConnectionMouseUp}
                        >
                            <img
                                className={styles.helpIcon}
                                src={disconnectedIcon}
                            />
                            <ReactTooltip
                                className={styles.warningTooltip}
                                id="deviceDisconnectedTip"
                                place="bottom"
                                effect="solid"
                            >
                                <FormattedMessage
                                    defaultMessage="Device is not connected!"
                                    description="Device is disconnected"
                                    id="gui.menuBar.deviceDisconnected"
                                />
                            </ReactTooltip>
                        </div>                  
                    )}
                    <Divider className={classNames(styles.divider)} />
                </div>

                <div className={styles.accountInfoGroup}>
                    <SaveStatus />
                    <div className={styles.menuBarItem}>
                        {this.props.canSave && (
                            <SaveStatus />
                        )}
                    </div>                    
                    {/* <div
                        className={classNames(styles.menuBarItem, styles.hoverable)}
                        onMouseUp={this.handleScreenshot}
                    >
                        <img
                            alt="Screenshot"
                            className={classNames(styles.screenShotLogo)}
                            draggable={false}
                            src={screenshotIcon}
                        />
                    </div> */}
                    <Divider className={classNames(styles.divider)} />
                    <div className={classNames(styles.menuBarItem, styles.programModeGroup)}>
                        <Switch
                            className={styles.programModeSwitch}
                            onChange={this.handleProgramModeSwitchOnChange}
                            checked={!this.props.isRealtimeMode}
                            disabled={this.props.isToolboxUpdating || !this.props.isSupportSwitchMode}
                            height={30}
                            width={100}
                            handleDiameter={24}
                            borderRadius={5}
                            onColor={this.props.isToolboxUpdating ||
                                !this.props.isSupportSwitchMode ? '#888888' : '#007D7D'}
                            offColor={this.props.isToolboxUpdating ||
                                !this.props.isSupportSwitchMode ? '#888888' : '#FF8C1A'}
                            uncheckedIcon={
                                <div className={styles.modeSwitchRealtime}>
                                    <FormattedMessage
                                        defaultMessage="Interactive"
                                        description="Button to switch to upload mode"
                                        id="gui.menu-bar.modeSwitchRealtimeInteractive"
                                    />
                                </div>
                            }
                            checkedIcon={
                                <div className={styles.modeSwitchUpload}>
                                    <FormattedMessage
                                        defaultMessage="Program"
                                        description="Button to switch to realtime mode"
                                        id="gui.menu-bar.modeSwitchRealtimeProgram"
                                    />
                                </div>
                            }
                        />
                    </div>
                    {isScratchDesktop() ? (
                        <div
                            className={classNames(styles.menuBarItem, styles.hoverable, {
                                [styles.active]: this.props.settingMenuOpen
                            })}
                            onMouseUp={this.props.onClickSetting}
                        >
                            <img
                                className={styles.settingIcon}
                                src={settingIcon}
                            />
                            <MenuBarMenu
                                className={classNames(styles.menuBarMenu)}
                                open={this.props.settingMenuOpen}
                                place={'left'}
                                onRequestClose={this.props.onRequestCloseSetting}
                            >
                                <MenuSection>
                                    <MenuItem
                                        isRtl={this.props.isRtl}
                                        onClick={this.handleCheckUpdate}
                                    >
                                        {checkUpdate}
                                    </MenuItem>
                                    <MenuItem
                                        isRtl={this.props.isRtl}
                                        onClick={this.handleClearCache}
                                    >
                                        {clearCache}
                                    </MenuItem>
                                </MenuSection>
                                <MenuSection>
                                    <MenuItem
                                        isRtl={this.props.isRtl}
                                        onClick={this.props.onClickInstallDriver}
                                    >
                                        {installDriver}
                                    </MenuItem>
                                </MenuSection>
                            </MenuBarMenu>
                        </div>
                    ) : null}

                    {/* show the proper UI in the account menu, given whether the user is logged in, and whether a session is available to log in with */}
                    {(this.props.sessionExists && this.props.username)  ? (
                        // ************ user is logged in ************
                        <React.Fragment>
                                <AccountNav
                                    className={classNames(
                                        styles.menuBarItem,
                                        styles.hoverable,
                                        {[styles.active]: this.props.accountMenuOpen}
                                    )}
                                    isOpen={this.props.accountMenuOpen}
                                    isRtl={this.props.isRtl}
                                    menuBarMenuClassName={classNames(styles.menuBarMenu)}
                                    onClick={this.props.onClickAccount}
                                    onClose={this.props.onRequestCloseAccount}
                                    onLogOut={this.props.onLogOut}
                                />
                            </React.Fragment>
                    ) : (
                        // ********* user not logged in, but a session exists so they can choose to log in ********
                        <React.Fragment>
                            <div
                                className={classNames(
                                    styles.menuBarItem,
                                    styles.hoverable
                                )}
                                key="login"
                                onMouseUp={this.props.onClickLogin}
                            >
                                <FormattedMessage
                                    defaultMessage="Sign in"
                                    description="Link for signing in to your Scratch account"
                                    id="gui.menuBar.signIn"
                                />
                                <LoginDropdown
                                    className={classNames(styles.menuBarMenu)}
                                    isOpen={this.props.loginMenuOpen}
                                    isRtl={this.props.isRtl}
                                    renderLogin={this.props.renderLogin}
                                    onClose={this.props.onRequestCloseLogin}
                                />
                            </div>
                        </React.Fragment>
                    )}
                </div>
                {/* {aboutButton} */}
            </Box>
        );
    }
}

MenuBar.propTypes = {
    aboutMenuOpen: PropTypes.bool,
    accountMenuOpen: PropTypes.bool,
    authorId: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    authorThumbnailUrl: PropTypes.string,
    authorUsername: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    autoUpdateProject: PropTypes.func,
    canChangeLanguage: PropTypes.bool,
    canCreateCopy: PropTypes.bool,
    canCreateNew: PropTypes.bool,
    canEditTitle: PropTypes.bool,
    canManageFiles: PropTypes.bool,
    canRemix: PropTypes.bool,
    canSave: PropTypes.bool,
    canShare: PropTypes.bool,
    className: PropTypes.string,
    confirmReadyToReplaceProject: PropTypes.func,
    confirmClearCache: PropTypes.func,
    editMenuOpen: PropTypes.bool,
    enableCommunity: PropTypes.bool,
    fileMenuOpen: PropTypes.bool,
    settingMenuOpen: PropTypes.bool,
    intl: intlShape,
    isUpdating: PropTypes.bool,
    isRealtimeMode: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool,
    isShared: PropTypes.bool,
    isShowingProject: PropTypes.bool,
    isSupportSwitchMode: PropTypes.bool,
    isToolboxUpdating: PropTypes.bool.isRequired,
    languageMenuOpen: PropTypes.bool,
    locale: PropTypes.string.isRequired,
    loginMenuOpen: PropTypes.bool,
    logo: PropTypes.string,
    onClickAbout: PropTypes.oneOfType([
        PropTypes.func, // button mode: call this callback when the About button is clicked
        PropTypes.arrayOf( // menu mode: list of items in the About menu
            PropTypes.shape({
                title: PropTypes.string, // text for the menu item
                onClick: PropTypes.func // call this callback when the menu item is clicked
            })
        )
    ]),
    onClickAccount: PropTypes.func,
    onClickEdit: PropTypes.func,
    onClickFile: PropTypes.func,
    onClickSetting: PropTypes.func,
    onClickLanguage: PropTypes.func,
    onClickLinkLogo: PropTypes.func,
    onClickLogin: PropTypes.func,
    onClickLogo: PropTypes.func,
    onClickNew: PropTypes.func,
    onClickRemix: PropTypes.func,
    onClickSave: PropTypes.func,
    onClickSaveAsCopy: PropTypes.func,
    onClickCheckUpdate: PropTypes.func,
    onClickClearCache: PropTypes.func,
    onClickInstallDriver: PropTypes.func,
    onLogOut: PropTypes.func,
    onNoPeripheralIsConnected: PropTypes.func.isRequired,
    onOpenRegistration: PropTypes.func,
    onOpenTipLibrary: PropTypes.func,
    onProjectTelemetryEvent: PropTypes.func,
    onRequestOpenAbout: PropTypes.func,
    onRequestCloseAbout: PropTypes.func,
    onRequestCloseAccount: PropTypes.func,
    onRequestCloseEdit: PropTypes.func,
    onRequestCloseFile: PropTypes.func,
    onRequestCloseSetting: PropTypes.func,
    onRequestCloseLanguage: PropTypes.func,
    onRequestCloseLogin: PropTypes.func,
    onSeeCommunity: PropTypes.func,
    onShare: PropTypes.func,
    onStartSelectingFileUpload: PropTypes.func,
    onToggleLoginOpen: PropTypes.func,
    projectTitle: PropTypes.string,
    realtimeConnection: PropTypes.bool.isRequired,
    renderLogin: PropTypes.func,
    sessionExists: PropTypes.bool,
    shouldSaveBeforeTransition: PropTypes.func,
    showComingSoon: PropTypes.bool,
    userOwnsProject: PropTypes.bool,
    username: PropTypes.string,
    stageSizeMode: PropTypes.oneOf(Object.keys(STAGE_SIZE_MODES)),
    vm: PropTypes.instanceOf(VM).isRequired,
    onSetUploadMode: PropTypes.func,
    onSetRealtimeConnection: PropTypes.func.isRequired,
    onSetRealtimeMode: PropTypes.func,
    onSetUpdate: PropTypes.func.isRequired,
    onOpenConnectionModal: PropTypes.func,
    onOpenUploadProgress: PropTypes.func,
    peripheralName: PropTypes.string,
    onDisconnect: PropTypes.func.isRequired,
    onWorkspaceIsEmpty: PropTypes.func.isRequired,
    onWorkspaceIsNotEmpty: PropTypes.func.isRequired,
    onOpenDeviceLibrary: PropTypes.func,
    onSetStageLarge: PropTypes.func.isRequired,
    deviceId: PropTypes.string,
    deviceName: PropTypes.string,
    deviceIcon: PropTypes.string,
    onDeviceIsEmpty: PropTypes.func,
    linkStatus: PropTypes.bool,
    onLinkConnected: PropTypes.func.isRequired,
    onLinkDisconnected: PropTypes.func.isRequired
};

MenuBar.defaultProps = {
    logo: scratchLogo,
    onShare: () => {}
};

const mapStateToProps = (state, ownProps) => {
    const loadingState = state.scratchGui.projectState.loadingState;
    const user = state.session && state.session.session && state.session.session.user;
    return {
        aboutMenuOpen: aboutMenuOpen(state),
        accountMenuOpen: accountMenuOpen(state),
        fileMenuOpen: fileMenuOpen(state),
        settingMenuOpen: settingMenuOpen(state),
        editMenuOpen: editMenuOpen(state),
        isUpdating: getIsUpdating(loadingState),
        isRealtimeMode: state.scratchGui.programMode.isRealtimeMode,
        isRtl: state.locales.isRtl,
        isShowingProject: getIsShowingProject(loadingState),
        isSupportSwitchMode: state.scratchGui.programMode.isSupportSwitchMode,
        isToolboxUpdating: state.scratchGui.toolbox.isToolboxUpdating,
        languageMenuOpen: languageMenuOpen(state),
        locale: state.locales.locale,
        loginMenuOpen: loginMenuOpen(state),
        projectTitle: state.scratchGui.projectTitle,
        realtimeConnection: state.scratchGui.connectionModal.realtimeConnection,
        sessionExists: state.session && typeof state.session.session !== 'undefined',
        username: user ? user.username : null,
        userOwnsProject: ownProps.authorUsername && user &&
            (ownProps.authorUsername === user.username),
        stageSizeMode: state.scratchGui.stageSize.stageSize,
        vm: state.scratchGui.vm,
        peripheralName: state.scratchGui.connectionModal.peripheralName,
        deviceId: state.scratchGui.device.deviceId,
        deviceName: state.scratchGui.device.deviceName,
        deviceIcon: state.scratchGui.device.deviceIcon,
        linkStatus: state.scratchGui.menus.linkStatus
    };
};

const mapDispatchToProps = dispatch => ({
    autoUpdateProject: () => dispatch(autoUpdateProject()),
    onOpenTipLibrary: () => dispatch(openTipsLibrary()),
    onClickAccount: () => dispatch(openAccountMenu()),
    onRequestCloseAccount: () => dispatch(closeAccountMenu()),
    onClickFile: () => dispatch(openFileMenu()),
    onRequestCloseFile: () => dispatch(closeFileMenu()),
    onClickSetting: () => dispatch(openSettingMenu()),
    onRequestCloseSetting: () => dispatch(closeSettingMenu()),
    onClickEdit: () => dispatch(openEditMenu()),
    onRequestCloseEdit: () => dispatch(closeEditMenu()),
    onClickLanguage: () => dispatch(openLanguageMenu()),
    onRequestCloseLanguage: () => dispatch(closeLanguageMenu()),
    onClickLogin: () => dispatch(openLoginMenu()),
    onRequestCloseLogin: () => dispatch(closeLoginMenu()),
    onRequestOpenAbout: () => dispatch(openAboutMenu()),
    onRequestCloseAbout: () => dispatch(closeAboutMenu()),    
    onClickNew: needSave => dispatch(requestNewProject(needSave)),
    onClickRemix: () => dispatch(remixProject()),
    onClickSave: () => dispatch(manualUpdateProject()),
    onClickSaveAsCopy: () => dispatch(saveProjectAsCopy()),
    onSeeCommunity: () => dispatch(setPlayer(true)),
    onSetUploadMode: () => {
        dispatch(setUploadMode());
        dispatch(setRealtimeConnection(false));
    },
    onSetRealtimeConnection: state => dispatch(setRealtimeConnection(state)),
    onSetRealtimeMode: () => dispatch(setRealtimeMode()),
    onSetStageLarge: () => dispatch(setStageSize(STAGE_SIZE_MODES.large)),
    onOpenConnectionModal: () => dispatch(openConnectionModal()),
    onOpenUploadProgress: () => dispatch(openUploadProgress()),
    onDisconnect: () => {
        dispatch(clearConnectionModalPeripheralName());
        dispatch(setRealtimeConnection(false));
    },
    onSetUpdate: message => {
        dispatch(setUpdate(message));
        dispatch(openUpdateModal());
    },
    onNoPeripheralIsConnected: () => showAlertWithTimeout(dispatch, 'connectAPeripheralFirst'),
    onWorkspaceIsEmpty: () => showAlertWithTimeout(dispatch, 'workspaceIsEmpty'),
    onWorkspaceIsNotEmpty: () => showAlertWithTimeout(dispatch, 'workspaceIsNotEmpty'),
    onOpenDeviceLibrary: () => dispatch(openDeviceLibrary()),
    onDeviceIsEmpty: () => showAlertWithTimeout(dispatch, 'selectADeviceFirst'),
    onLinkConnected: () => {
        dispatch(setLinkStatus(true));
    },
    onLinkDisconnected: () => {
        dispatch(setLinkStatus(false));
    }
});

export default compose(
    injectIntl,
    MenuBarHOC,
    connect(
        mapStateToProps,
        mapDispatchToProps
    )
)(MenuBar);
