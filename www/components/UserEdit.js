import React from 'react'

class UserEdit extends React.Component {
  render () {
    var props = this.props
    return (
      <div>
        <div>{JSON.stringify(props.socialUser)}</div>
        <div>{JSON.stringify(props.dbUser)}</div>
      </div>
    )
  }
}
export default UserEdit
