import PropTypes from 'prop-types';
import React from 'react';

import styles from './radio-button.css';
    

class RadioButtonGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            optionValue: this.props.defaultValue
        };
    }

    renderItems(item) {
        return ( 
            <label key={item.value} className={styles.radioButtonItem}>
                <input type="radio" name="options" value={item.value} 
                    checked={this.state.optionValue === item.value}
                    onChange={(e) => this.handleQueryOpChange(e)}
                    id={item.value}
                /> 
                <span>{item.text}</span> 
            </label>
        );
    };
    
    handleQueryOpChange(e) {
        this.setState({
            optionValue: e.target.value
        });
        this.props.selectedItemCallback(e.target.value);
    }

    render () {
        return ( 
            <div className={styles.radioButtonGroup}>{this.props.listOfItems.map((item) => this.renderItems(item))}</div>
        );
    }
}

RadioButtonGroup.propTypes = {
    defaultValue: PropTypes.string,
    listOfItems: PropTypes.array.isRequired,
    selectedItemCallback: PropTypes.func.isRequired
};


export default RadioButtonGroup;