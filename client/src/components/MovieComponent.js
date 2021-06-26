import { useEffect, useState } from "react";
import { Col, Container, Row } from 'react-bootstrap'
import { useHistory } from "react-router";
import { SkeletonTheme } from "react-loading-skeleton";
import LoadingComponent from "./LoadingComponent";

function MovieComponent({id}) {

    const [movie, setMovie] = useState(null)
    const [loading,setLoading] = useState(true)
    const [error,setError] = useState({
        main: '',
        cast: ''
    })

    const history = useHistory()

    const dispCast = (id) => {
        history.push(`/cast/${id}`)
    }

    useEffect(() => {
        window.scrollTo(0,0)
        fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.REACT_APP_API_KEY}&language=en-US`)
            .then(res => {
                if(!res.ok)
                    throw new Error({type:"main",message:"Server error"})
                else return res.json()
            })
            .then(data => {
                const options = {year: 'numeric', month: 'long', day: 'numeric' }
                const filteredMovie = {
                    title: data.original_title,
                    description: data.overview,
                    imdbUrl: data.homepage,
                    genres: data.genres ? data.genres.map(genre => genre.name):null,
                    budget: data.budget,
                    releaseDate: data.release_date? new Date(data.release_date).toLocaleDateString('en-UK',options) : null,
                    revenue: data.revenue,
                    runtime: data.runtime,
                    tagline: data.tagline,
                    rating: data.vote_average,
                    language: data.original_language,
                    imgUrl: data.poster_path ? `https://image.tmdb.org/t/p/w342/${data.poster_path}` : 'https://faculty.eng.ufl.edu/dobson-lab/wp-content/uploads/sites/88/2015/11/img-placeholder.png',
                    backdropUrl: `https://image.tmdb.org/t/p/w1280/${data.backdrop_path}`
                }
                setMovie(filteredMovie)
                return fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${process.env.REACT_APP_API_KEY}&language=en-US`)
            })
            .then(setTimeout(() => setLoading(false), 200))
            .then(res => {
                if (!res.ok)
                    throw new Error({type:"feed",message:"Server error"})
                else return res.json()
            })
            .then(data => {
                setMovie(prevState => {
                    return {
                        ...prevState,
                        cast: data.cast ? data.cast.slice(0,20).map(c =>  ({
                            id: c.id,
                            name: c.name, 
                            pictureUrl: c.profile_path ? `https://image.tmdb.org/t/p/w185/${c.profile_path}` : 'https://static.stayjapan.com/assets/user_no_photo-4896a2d64d70a002deec3046d0b6ea6e7f01628781493566c95a02361524af97.png', 
                            character:c.character
                        })) : [],
                        producers: data.crew? data.crew.filter(c => c.job === "Producer").map(c => c.name): null,
                        directors: data.crew? data.crew.filter(c => c.job === "Director").map(c => c.name):null
                    }
                })
            })
            .catch(err => {
                setLoading(false)
                if(err.type === 'main')
                    setError({main: err.message, feed: ''})
                else 
                    setError({main: '', feed: err.message})
            })
    },[id])

    if(error.main) {
        return(
            <h3 className='text-muted text-center' style={{margin:'15% auto', minHeight:'50vh'}}>{error}<br />Try again</h3>
        )
    }

    if(loading) {
        return (
            <SkeletonTheme color="#505050" highlightColor="#303030">
                <LoadingComponent page="movie" />
            </SkeletonTheme>
        )
    }

    if(movie) {
        const genres = movie.genres ? movie.genres.map(g => <p className='genre-pill' key={g}>{g}</p>) : []     
        const producers = movie.producers ? movie.producers.map((p, idx) => idx !== movie.producers.length - 1 ? p + ', ' : p) : []
        const directors = movie.directors ? movie.directors.map((p, idx) => idx !== movie.directors.length - 1 ? p + ', ' : p) : []
        const cast = movie.cast ? movie.cast.map(c => {
            return (
                <div className='cast-card' key={c.id} onClick={() => dispCast(c.id)}>
                    <img src={c.pictureUrl} alt='actor' />
                    <div className='px-2 pb-1 pt-2' style={{height:'max-content'}}>
                        <h5>{c.name}</h5>
                        <h6 className='font-weight-light'>as {c.character || '-'}</h6>
                    </div>
                </div>
            )
        }) : null
        return(
            <div className='movie-page'>
                <div className='movie-page-header' style={{backgroundImage:'linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)),url('+ movie.backdropUrl + ')'}}>
                    <img src={movie.imgUrl} alt="movie poster" className='d-none d-md-block' height="512px" width="342px" />
                    <div className='header-details'>
                        <a href={movie.imdbUrl} title="Visit movie website">{movie.title}</a>
                        <h5 className='font-weight-light font-italic'>{movie.tagline}</h5>
                        <div>{genres}</div>
                        <h5 className='my-2'>⭐ {movie.rating || 'NR'}</h5>
                        <p>{movie.language.toUpperCase()} • {movie.releaseDate || 'In Production'} {movie.runtime? <>• <i className='fas fa-clock'></i>{' '}{movie.runtime} mins</> : null}</p>
                        <div>
                            <b>Producer(s): </b>
                            <p>{producers.length ? producers : '-'}</p>
                            <b>Director(s): </b>
                            <p>{directors.length? directors : '-'}</p>
                        </div>
                        <p>
                            <b>Estimated Budget:</b> {movie.budget ? '$'+movie.budget.toLocaleString('en-UK') : '-'} | <b>Gross Revenue: </b>{movie.revenue ? '$'+movie.revenue.toLocaleString('en-UK') : '-'}
                        </p>
                    </div>
                </div>
                <div className='movie-page-body'>
                    <Container>
                        <Row>
                            <Col xs className='mb-3'>
                                <h3 className='movie-page-heading'>Overview</h3>
                                 <p>{movie.description || <span className='font-italic text-muted'>no overview available</span>}</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs className='mb-3'>
                                <h3 className='movie-page-heading'>Top Cast Cembers</h3>
                                <div className='cast-feed'>
                                    {error.feed ? <p className='text-italic text-muted font-italic'>Couldn't fetch the cast.<br />Try again later.</p> : cast? cast.length? cast : <p className='text-muted font-italic'>cast details unavailable</p>: <LoadingComponent page="cast-feed" />}
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs className='mb-3'>
                                <h3 className='movie-page-heading'>Reviews</h3>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </div>
        )
    }

    return null;
}

export default MovieComponent