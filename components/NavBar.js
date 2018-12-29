import Link from 'next/link'

const NavBar = () => {
  var items = []
  items.push((<li key='home' className='nav-item active'>
    <Link href='/'>
      <a className='nav-link'>Home <span className='sr-only'>(current)</span></a>
    </Link>
  </li>))

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
export default NavBar
