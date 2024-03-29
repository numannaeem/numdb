import { useEffect, useState } from 'react';
import { Row, Col, Container, Button, ButtonGroup } from "react-bootstrap";
import { useHistory } from 'react-router';
import { SkeletonTheme } from 'react-loading-skeleton';
import { Link } from "react-router-dom";
import { CSSTransition } from 'react-transition-group'
import LoadingComponent from './LoadingComponent';

function TopRatedPage(props) {

    const [movieList,setMovieList] = useState(null)
    const [totalPages, setTotalPages] = useState(0)
    const [error, setError] = useState('')

    const history = useHistory();

    const changePage = (dir) => {
        if(dir === 'beg') {
            history.push(`/top-rated/1`)
        }
        if(dir === 'prev') {
            history.push(`/top-rated/${Number(props.page) - 1}`)
        }
        if(dir === 'next') {
            history.push(`/top-rated/${Number(props.page) + 1}`)
        }
        if(dir==='last') {
            history.push(`/top-rated/${totalPages}`)
        }
    }

    useEffect(() => {
        window.scrollTo(0, 0)
        setMovieList(null)
        setError('')
        fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.REACT_APP_API_KEY}&language=en-US&page=${props.page}`)
            .then((res) => {
                if(!res.ok)
                    throw new Error("Server error")
                else
                    return res.json()
                })    
            .then(data => {
                const filteredMovies = data.results ? data.results.map((movie) => ({
                    id: movie.id,
                    title: movie.title,
                    description: movie.overview,
                    imgUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w342/${movie.poster_path}` : 'https://faculty.eng.ufl.edu/dobson-lab/wp-content/uploads/sites/88/2015/11/img-placeholder.png',
                    releaseDate: movie.release_date? new Date(movie.release_date).toLocaleDateString('en-US', {year: 'numeric'}) : null,
                    rating:movie.vote_average,
                })) : null
                setTotalPages(data.total_pages)
                setMovieList(filteredMovies)
            })
            .catch((err) => setError(err.message))
    },[props.page, history])

    const movieCards = movieList? movieList.map(movie => {
        return(
            <Col xs={6} sm={6} md={4} lg={3} className='p-sm-3 p-2 text-center' key={movie.id}>
               <Link to={`/movie/${movie.id}`}>
                   <div className='movie-card'>
                        <div className='movie-card-header'>
                            <h5 className='mx-2'>{movie.title}</h5>
                            <div style={{display:'flex', justifyContent:'space-between', margin:'5%',alignItems:'center'}}>
                                <span>⭐ {movie.rating || 'NR'}</span>
                                <span className='ml-2' style={{color:'lightgray'}}>{movie.releaseDate || ''}</span>
                            </div>
                        </div>
                        <img src={movie.imgUrl} alt='poster' height='379px' width='253px'/>
                   </div>
               </Link>
            </Col>
        )
    }) : null

    return(
        <SkeletonTheme color="#505050" highlightColor="#303030">
            <Container style={{minHeight:'200vh', display:'flex', flexDirection:'column'}}>
                <div className='feed-page-header text-center m-5'>
                    <h2>Top Rated Movies</h2>
                    <div className='text-center mt-4'>
                        <ButtonGroup>
                            <Button variant="warning" disabled={props.page <= '1'}  onClick={() => changePage('beg')}><i className='fa fa-angle-double-left'></i></Button>
                            <Button variant="warning" disabled={props.page <= '1'}  onClick={() => changePage('prev')}><i className='fa fa-angle-left'></i></Button>
                            <div className='page-number'><p className='mb-0'>{props.page}</p></div>
                            <Button variant="warning" disabled={props.page >= totalPages} onClick={() => changePage('next')}><i className='fa fa-angle-right'></i></Button>
                            <Button variant="warning" disabled={props.page >= totalPages} onClick={() => changePage('last')}><i className='fa fa-angle-double-right'></i></Button>
                        </ButtonGroup>
                    </div>
                </div>
                <CSSTransition in={Boolean(movieCards)} timeout={400} classNames='movie-cards'>
                    <Row className='mb-5'>
                        { movieCards && movieCards.length ? movieCards 
                        : error ? <h3 className="my-5 text-muted mx-auto text-center" style={{height:'30vh'}}>{error || "Something went wrong"}<br />Try again later</h3>
                        : <LoadingComponent page='feed' /> 
                        }     
                    </Row>
                </CSSTransition>
                <div className='text-center mb-5 mt-auto'>
                    <ButtonGroup>
                        <Button variant="warning" disabled={props.page <= '1'}  onClick={() => changePage('beg')}><i className='fa fa-angle-double-left'></i></Button>
                        <Button variant="warning" disabled={props.page <= '1'}  onClick={() => changePage('prev')}><i className='fa fa-angle-left'></i></Button>
                        <div className='page-number'><p className='mb-0'>{props.page}</p></div>
                        <Button variant="warning" disabled={props.page >= totalPages} onClick={() => changePage('next')}><i className='fa fa-angle-right'></i></Button>
                        <Button variant="warning" disabled={props.page >= totalPages} onClick={() => changePage('last')}><i className='fa fa-angle-double-right'></i></Button>
                    </ButtonGroup>
                </div>
            </Container>
        </SkeletonTheme>
    )

}

export default TopRatedPage