import Layout from '../components/Layout'
import React from 'react'

import { getUserFromLocalCookie, getUserFromServerCookie, getMe, getMeFromServer } from '../utils/auth'
import RecentPosts from '../components/RecentPosts'
import UserEdit from '../components/UserEdit'

class Index extends React.Component {
  constructor () {
    super()
    this.state = {
      dbUser: null
    }
    this.updateUser = this.updateUser.bind(this)
  }
  static async getInitialProps (ctx) {
    var socialUser = process.browser ? getUserFromLocalCookie() : getUserFromServerCookie(ctx.req)
    var dbUser = process.browser ? await getMe() : await getMeFromServer(ctx.req)
    return { socialUser, dbUser }
  }
  async componentWillMount () {
    var socialUser = getUserFromLocalCookie()
    const dbUser = process.browser ? await getMe() : null
    this.setState({ dbUser: dbUser })
    return { socialUser, dbUser }
  }
  async updateUser (dbUser) {
    this.setState({ dbUser: dbUser })
  }
  render () {
    var props = this.props
    return (
      <Layout socialUser={props.socialUser}
        dbUser={this.state.dbUser || props.dbUser}>
        <UserEdit onChange={this.updateUser}
          socialUser={props.socialUser}
          dbUser={this.state.dbUser || props.dbUser} />
        <RecentPosts />
      </Layout>
    )
  }
}
export default Index
