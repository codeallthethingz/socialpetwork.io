import React from 'react'

export default class Thumb extends React.Component {
  state = {
    thumb: undefined
  }

  render () {
    if (!this.state.thumb) {
      let reader = new FileReader()
      reader.onloadend = () => {
        this.setState({ thumb: reader.result })
      }
      reader.readAsDataURL(this.props.file)
    }
    return (<img src={this.state.thumb} height={50} />)
  }
}
