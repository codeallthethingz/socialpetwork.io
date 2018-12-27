import Link from 'next/link'

const NavBar = () => (
  <nav className='navbar navbar-expand-lg navbar-dark bg-primary'>
    <a className='navbar-brand' href='#'>Navbar</a>
    <div className='expand navbar-expand'>

      <ul className='navbar-nav mr-auto'>
        <li className='nav-item active'>
          <Link href='/'>
            <a className='nav-link'>Home <span className='sr-only'>(current)</span></a>
          </Link>
        </li>
        <li className='nav-item'>
          <Link href='/about'>
            <a className='nav-link'>About <span className='sr-only'>(current)</span></a>
          </Link>
        </li>
        <li className='nav-item'>
          <Link href='/create'>
            <a className='nav-link'>Create <span className='sr-only'>(current)</span></a>
          </Link>
        </li>
      </ul>
    </div>
  </nav>
)

export default NavBar
