import { useEffect, useState } from "react";
import { Container, Row, Col, Button, ButtonGroup, ToggleButton } from "react-bootstrap";
import { useHistory, useLocation } from "react-router";
import { SkeletonTheme } from "react-loading-skeleton";
import LoadingComponent from "./LoadingComponent";

function SearchResultsPage (props) {
    const [resultList,setResultList] = useState(null)
    const [totalResults, setTotalResults] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchType, setSearchType] = useState('movie')

    const history = useHistory();
    const query = new URLSearchParams(useLocation().search)
    const queryText = query.get('query')
    const queryPage = query.get('page')
    
    const dispMovie = (id) => {
        history.push(`/movie/${id}`)
    }

    const dispPerson = (id) => {
        history.push(`/cast/${id}`)
    }

    const changePage = (dir) => {
        window.scrollTo(0,0)
        if(dir === 'beg') {
            history.push(`/search?query=${queryText}&page=1`)
        }
        if(dir === 'prev') {
            history.push(`/search?query=${queryText}&page=${Number(queryPage) - 1}`)
        }
        if(dir === 'next') {
            history.push(`/search?query=${queryText}&page=${Number(queryPage) + 1}`)
        }
        if(dir==='last') {
            history.push(`/search?query=${queryText}&page=${totalPages}`)
        }
    }

    
    useEffect(() => {
        setLoading(true)
        if(queryText)
            fetch(`https://api.themoviedb.org/3/search/${searchType}?api_key=${process.env.REACT_APP_API_KEY}&language=en-US&query=${queryText}&page=${queryPage}&include_adult=false`)
                .then(res => {
                    if(res.ok)
                        return res.json()
                    else throw new Error("Server down. Please try later.")
                })
                .then(data => {
                    setTotalResults(data.total_results)
                    setTotalPages(data.total_pages)
                    if (data.total_pages < queryPage)
                        history.push(`/search?query=${queryText}&page=1`)
                    else if(searchType === 'person') {
                        const filteredResults = data.results.map((person) => ({
                            id:person.id,
                            name:person.name,
                            imgUrl: person.profile_path ? `https://image.tmdb.org/t/p/w185/${person.profile_path}` : 'https://static.stayjapan.com/assets/user_no_photo-4896a2d64d70a002deec3046d0b6ea6e7f01628781493566c95a02361524af97.png' ,
                            department: person.known_for_department
                        }))
                        setResultList(filteredResults)
                    }
                    else {
                        const options = {year: 'numeric', month: 'long', day: 'numeric' }
                        const filteredMovies = data.results.map((movie) => ({
                            id: movie.id,
                            title: movie.original_title,
                            description: movie.overview,
                            imgUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w342/${movie.poster_path}` : 'https://faculty.eng.ufl.edu/dobson-lab/wp-content/uploads/sites/88/2015/11/img-placeholder.png',
                            releaseDate: movie.release_date? new Date(movie.release_date).toLocaleDateString('en-UK',options) :null,
                            rating:movie.vote_average
                        }))
                        setResultList(filteredMovies)
                    }
                })
                .then(setTimeout(() => setLoading(false), 400))
                .catch(err => setError(err.message))
    },[queryText, queryPage, searchType, history])

    const movieCards = resultList ? searchType==='movie' ? resultList.map(movie => {
        return(
            <Col xs={6} sm={6} md={4} lg={3} className='p-sm-3 p-2 text-center' key={movie.id} onClick={() => dispMovie(movie.id)}>
               <div className='movie-card'>
                    <div className='movie-card-header'>
                        <h5 className='mx-2 my-auto'>{movie.title}</h5>
                        <div style={{display:'flex', justifyContent:'space-between', margin:'5%',alignItems:'center'}}>
                            <span>⭐ {movie.rating || 'NR'}</span>
                            <span className='ml-2' style={{color:'lightgray'}}>{movie.releaseDate || ''}</span>
                        </div>
                    </div>
                    <img src={movie.imgUrl} alt='poster'/>
               </div>
            </Col>
        )
    }) : resultList.map(person => {
        return(
            <Col xs={6} sm={4} md={3} lg={2} className='p-sm-3 p-2' key={person.id} onClick={() => dispPerson(person.id)}>
               <div className='person-card'>
                    <img src={person.imgUrl} alt='poster'/>
                    <div className='person-card-details'>
                        <h5>{person.name}</h5>
                        <h6 className='font-italic'>{person.department || ''}</h6>
                    </div>
               </div>
            </Col>
        )
    }) : null

    function handleChange(e) {
        setResultList(null)
        setSearchType(e.target.value)
    }

    if(queryText)
        return(
            <SkeletonTheme color="#505050" highlightColor="#303030">
                <Container style={{minHeight:'120vh'}}>
                    <div className='feed-page-header text-center mt-5'>
                        <h1>Search Results</h1>
                        <div className='search-type'>
                            <ButtonGroup toggle>
                                <ToggleButton id="movie" checked={searchType === 'movie'} value='movie' onChange={(e) => handleChange(e)} type="radio" >
                                    Movies
                                </ToggleButton>
                                <ToggleButton id="person" checked={searchType === 'person'} value='person' onChange={(e) => handleChange(e)} type="radio" >
                                    People
                                </ToggleButton>
                            </ButtonGroup>
                        </div>
                        <h5 className='font-weight-light text-light'>{totalResults} matches found</h5>
                    </div>
                    {totalPages > 1? <div className='text-center mb-4'>
                        <ButtonGroup>
                            <Button variant="warning" disabled={queryPage <= '1'}  onClick={() => changePage('beg')}><i className='fa fa-angle-double-left'></i></Button>
                            <Button variant="warning" disabled={queryPage <= '1'}  onClick={() => changePage('prev')}><i className='fa fa-angle-left'></i></Button>
                            <div className='page-number'><p className='mb-0'>{queryPage}</p></div>
                            <Button variant="warning" disabled={queryPage >= totalPages} onClick={() => changePage('next')}><i className='fa fa-angle-right'></i></Button>
                            <Button variant="warning" disabled={queryPage >= totalPages} onClick={() => changePage('last')}><i className='fa fa-angle-double-right'></i></Button>
                        </ButtonGroup>
                    </div> : null}
                    <Row className='mb-5'>
                        {error? <h2 className='mx-auto my-5 text-muted' style={{height:'50vh'}}>{error}<br />Please try again later.</h2> : loading? <LoadingComponent page="feed" /> : resultList && resultList.length ? movieCards : <h2 className='mx-auto my-5 text-muted' style={{height:'50vh'}}>No results</h2>}
                    </Row>
                    {totalPages > 1? <div className='text-center mb-5'>
                        <ButtonGroup>
                            <Button variant="warning" disabled={queryPage <= '1'}  onClick={() => changePage('beg')}><i className='fa fa-angle-double-left'></i></Button>
                            <Button variant="warning" disabled={queryPage <= '1'}  onClick={() => changePage('prev')}><i className='fa fa-angle-left'></i></Button>
                            <div className='page-number'><p className='mb-0'>{queryPage}</p></div>
                            <Button variant="warning" disabled={queryPage >= totalPages} onClick={() => changePage('next')}><i className='fa fa-angle-right'></i></Button>
                            <Button variant="warning" disabled={queryPage >= totalPages} onClick={() => changePage('last')}><i className='fa fa-angle-double-right'></i></Button>
                        </ButtonGroup>
                    </div> : null}
                </Container>
            </SkeletonTheme>
        )
    return(
        <div style={{minHeight:'80vh',display:'flex',alignItems:'center', justifyContent:'center'}}>
            <h3 className="text-center text-muted">Search for a movie using the search bar above!</h3>
        </div>
    )
}

export default SearchResultsPage