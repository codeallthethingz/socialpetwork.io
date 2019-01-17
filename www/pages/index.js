import Layout from '../components/Layout'
import React from 'react'
import { renew } from '../utils/auth0'

import { getUserFromLocalCookie, getUserFromServerCookie, getMe, getMeFromServer, isExpired } from '../utils/auth'
import RecentPosts from '../components/RecentPosts'
import UserEdit from '../components/UserEdit'

class Index extends React.Component {
  static async getInitialProps (ctx) {
    var socialUser = process.browser ? getUserFromLocalCookie() : getUserFromServerCookie(ctx.req)
    var dbUser = process.browser ? await getMe() : await getMeFromServer(ctx.req)
    return { socialUser, dbUser }
  }

  async componentWillMount () {
    var socialUser = getUserFromLocalCookie()
    const dbUser = await getMe()
    return { socialUser, dbUser }
  }

  render () {
    var props = this.props
    return (
      <Layout socialUser={props.socialUser}>
        <UserEdit socialUser={props.socialUser} dbUser={props.dbUser} />
        <RecentPosts />
      </Layout>
    )
  }
}
export default Index
