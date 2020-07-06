const {Component} = require('react');

class BrowserSync extends Component {
  constructor(props) {
    super(props);
    this.state = {
      address: this.props.browser.address,
    };
  }
}

// var browserSync = require('browser-sync').create();
// var url = 'https://www.google.com';
// browserSync.init({
//   proxy: url,
// });
