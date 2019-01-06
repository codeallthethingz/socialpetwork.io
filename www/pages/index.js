import Layout from '../components/Layout'
import React from 'react'

import { getUserFromLocalCookie, getUserFromServerCookie } from '../utils/auth'
import RecentPosts from '../components/RecentPosts'

class Index extends React.Component {
  static getInitialProps (ctx) {
    const loggedUser = process.browser ? getUserFromLocalCookie() : getUserFromServerCookie(ctx.req)
    const pageProps = Layout.getInitialProps && Layout.getInitialProps(ctx)
    React.loggedUser = loggedUser
    return {
      ...pageProps,
      loggedUser,
      currentUrl: ctx.pathname,
      isAuthenticated: !!loggedUser
    }
  }

  componentWillMount () {
    const loggedUser = getUserFromLocalCookie()
    if (loggedUser) {
      React.loggedUser = loggedUser
    }
  }

  render (props) {
    return (
      <Layout>
        <RecentPosts />
      </Layout>
    )
  }
}
export default Index
