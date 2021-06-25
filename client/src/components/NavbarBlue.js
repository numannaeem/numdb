import { useRef, useState } from 'react';
import { Navbar, Nav, Form, Button, InputGroup } from 'react-bootstrap';
import { useHistory, withRouter } from 'react-router';
import { NavLink } from 'react-router-dom'

function NavbarBlue(props) {

  const searchRef = useRef('')
  const history = useHistory();

  const [expanded, setExpanded] = useState(false)

  const search = (e,query) => {
    e.preventDefault()
    if(query) {
      setExpanded(false)
      history.push(`/search?query=${query}&page=1`);
    }
  }

  return (
    <Navbar className='navbar-blue' variant='dark' expand='md' sticky='top' expanded={expanded}>
      <Navbar.Brand href='/home'>🎬 NuMDb</Navbar.Brand>
      <Navbar.Toggle onClick={() => setExpanded((prev) => !prev)} />
      <Navbar.Collapse id='navbar-main'>
        <Nav className='mr-auto'>
          <NavLink activeClassName="navbar-link-active" onClick={() => {if(expanded) setExpanded(false)}} className='navbar-link' to="/popular">Popular</NavLink>
          <NavLink activeClassName="navbar-link-active" onClick={() => {if(expanded) setExpanded(false)}} className='navbar-link' to="/top-rated">Top Rated</NavLink>
          <NavLink activeClassName="navbar-link-active" onClick={() => {if(expanded) setExpanded(false)}} className='navbar-link' to="/upcoming">Upcoming</NavLink>
        </Nav>
        <Form onSubmit={(e) => search(e,searchRef.current.value)}>
          <InputGroup style={{maxWidth:"250px"}} >
            <Form.Control type="text" placeholder="Search" ref={searchRef} />
            <InputGroup.Append>
              <Button type='submit' variant="outline-light"><i className='fa fa-search'></i></Button>
            </InputGroup.Append>
          </InputGroup>
        </Form>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default withRouter(NavbarBlue)