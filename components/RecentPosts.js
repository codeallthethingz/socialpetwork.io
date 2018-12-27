import React, { Component } from 'react'
import axios from 'axios'

class RecentPosts extends Component {
  constructor () {
    super()
    this.state = {
      posts: []
    }
  }

  componentDidMount () {
    axios.get(`/api/recentPosts/index.js`)
      .then(res => {
        this.setState({ posts: res.data.data.posts })
      })
  }

  render () {
    return (
      <div>
        <ul>
          {this.state.posts.map(post =>
            <li key={post.id}>{post.title}
              <img width='100px' src={post.media.url} />

            </li>
          )}
        </ul>
      </div>
    )
  }
}
export default RecentPosts
