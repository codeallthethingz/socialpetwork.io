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
    return (<img onClick={this.props.onClick} src={this.state.thumb} height={50} />)
  }
}
