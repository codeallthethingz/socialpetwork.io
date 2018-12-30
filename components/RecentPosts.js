import React, { Component } from 'react'
import axios from 'axios'
import CreatePost from './CreatePost'

class RecentPosts extends Component {
  constructor () {
    super()
    this.state = {
      posts: []
    }
    this.loadValues = this.loadValues.bind(this)
  }
  componentDidMount () {
    this.loadValues()
  }

  loadValues () {
    axios.get(`/api/recentPosts/index.js`).then(res => {
      this.setState(function (state, props) {
        console.log(res)
        var posts = res.data && res.data.data && res.data.data.posts ? res.data.data.posts.map(item => { return { id: item._id, media: item.media, title: item.title } }) : []
        return { posts: posts }
      })
    })
  }

  render () {
    if (this.state.posts.length > 0) {
      return (
        <div>
          <CreatePost onChange={this.loadValues} />
          <ul>
            {this.state.posts.map(post => (
              <li key={post.id} id={post.id}>
                {post.title}
                {post.media.map((media, index) => (
                  <img width='100px' id={index + media.hash} key={index + media.hash} src={'https://storage.googleapis.com/socialpetwork-images/' + media.hash} />
                ))}
              </li>
            ))}
          </ul>
        </div>
      )
    } else {
      return <div>Loading...</div>
    }
  }
}
export default RecentPosts
