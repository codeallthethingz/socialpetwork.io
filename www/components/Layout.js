import NavBar from './NavBar'
import Head from 'next/head'
import Router from 'next/router'
import React from 'react'

class Layout extends React.Component {
  constructor (props) {
    super(props)

    this.logout = this.logout.bind(this)
  }

  logout (eve) {
    if (eve.key === 'logout') {
      Router.push(`/?logout=${eve.newValue}`)
    }
  }

  componentDidMount () {
    window.addEventListener('storage', this.logout, false)
  }

  componentWillUnmount () {
    window.removeEventListener('storage', this.logout, false)
  }

  render () {
    return (
      <div>
        <Head>
          <link rel='shortcut icon' type='image/png' href='/static/img/favicon.ico' />
          <link rel='stylesheet' href='https://bootswatch.com/4/minty/bootstrap.css' key='theme' />
          <link rel='stylesheet' href='/static/css/main.css' key='overrides' />
        </Head>
        <NavBar />
        <div className='container'>
          {this.props.children}
        </div>
      </div>
    )
  }
}

export default Layout
