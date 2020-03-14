// @flow
import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import AddressBar from './AddressBar';
import routes from '../constants/routes';
import styles from './Home.css';

type Props = {};

export default class Home extends Component<Props> {
    props: Props;

    render() {
        return (
            <div className={styles.container} data-tid="container">
                <AddressBar address="https://www.google.com" />
                <h2>Home</h2>
            </div>
        );
    }
}
