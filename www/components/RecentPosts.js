import React, { Component } from 'react'
import axios from 'axios'
import CreatePost from './CreatePost'
import Moment from 'react-moment'

class RecentPosts extends Component {
  constructor () {
    super()
    this.state = {
      posts: [],
      loading: true
    }
    this.loadValues = this.loadValues.bind(this)
  }
  componentDidMount () {
    this.loadValues()
  }

  loadValues () {
    this.setState({ loading: true })
    axios.get(`/api/recentPosts/index.js`).then(res => {
      this.setState(function (state, props) {
        var posts = res.data && res.data.data && res.data.data.posts ? res.data.data.posts.map(item => { return { id: item._id, media: item.media, title: item.title, epoch: item.epoch } }) : []
        return { posts: posts, loading: false }
      })
    })
  }

  render () {
    return (
      <div id='recentPosts'>
        <CreatePost onChange={this.loadValues} />
        <ul>
          {this.state.loading &&
          <li key='loading'>Loading...</li>
          }
          {this.state.posts.map(post => (
            <li key={post.id} id={post.id} >
              <p><Moment unix fromNow>{post.epoch / 1000}</Moment><br />{post.title}</p>
              <div className='images'>
                {post.media.map((media, index) => (
                  <img width='100px' id={index + media.hash} key={index + media.hash} src={'https://storage.googleapis.com/socialpetwork-images/' + media.hash} />
                ))}
              </div>
            </li>
          ))}
        </ul>

      </div>
    )
  }
}
export default RecentPosts
