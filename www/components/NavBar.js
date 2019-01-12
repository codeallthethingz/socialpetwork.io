import Link from 'next/link'
import React from 'react'

class NavBar extends React.Component {
  render () {
    var props = this.props
    var items = []
    items.push((<li key='home' className='nav-item active'>
      <Link href='/'>
        <a className='nav-link'>Home <span className='sr-only'>(current)</span></a>
      </Link>
    </li>))
    if (!props.socialUser) {
      items.push((
        <li key='sign-in' className='nav-item active'>
          <Link href='/auth/sign-in'>
            <a className='nav-link'>Sign In <span className='sr-only'>(current)</span></a>
          </Link>
        </li>
      ))
    } else {
      items.push((
        <li key='sign-off' className='nav-item active'>
          <Link href='/auth/sign-off'>
            <a className='nav-link'>Sign Out <span className='sr-only'>(current)</span></a>
          </Link>
        </li>
      ))
    }

    return (
      <nav className='navbar navbar-expand-lg navbar-dark bg-primary'>
        <a className='navbar-brand' href='/'>Social Petwork</a>
        <div className='expand navbar-expand'>
          <ul className='navbar-nav mr-auto'>
            {items}
          </ul>
        </div>
      </nav>
    )
  }
}
export default NavBar
