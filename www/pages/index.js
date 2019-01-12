import Layout from '../components/Layout'
import React from 'react'

import { getUserFromLocalCookie, getUserFromServerCookie, getMe, getMeFromServer } from '../utils/auth'
import RecentPosts from '../components/RecentPosts'
import UserEdit from '../components/UserEdit'

class Index extends React.Component {
  static async getInitialProps (ctx) {
    var socialUser = process.browser ? getUserFromLocalCookie() : getUserFromServerCookie(ctx.req)
    console.log('socialUser', socialUser)
    var dbUser = process.browser ? await getMe() : await getMeFromServer(ctx.req)
    return { socialUser, dbUser }
  }

  async componentWillMount () {
    const socialUser = getUserFromLocalCookie()
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
