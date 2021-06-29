import { useEffect, useRef, useState } from "react";
import { Col, Container, Row } from 'react-bootstrap'
import { useHistory } from "react-router";
import { SkeletonTheme } from "react-loading-skeleton";
import LoadingComponent from "./LoadingComponent";
import { AddButton, DeleteButton } from "./watchlistButtons";
import { languages } from '../shared/languages'
import YoutubeEmbed from "./YoutubeEmbed";

function MovieComponent({id}) {

    const [movie, setMovie] = useState(null)
    const [error,setError] = useState(null)
    const [inWatchlist, setInWatchlist] = useState(Boolean(localStorage.getItem(`mId:${id}`)))
    const [reviewFeedExpanded, setReviewFeedExpanded] = useState(false);
    const reviewFeedRef = useRef(null)

    const history = useHistory()

    const dispCast = (id) => {
        history.push(`/cast/${id}`)
    }

    useEffect(() => {
        window.scrollTo(0,0)
        fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.REACT_APP_API_KEY}&language=en-US&append_to_response=credits,reviews,videos`)
            .then(res => {
                if(!res.ok)
                    throw new Error("Server error")
                else return res.json()
            })
            .then(data => {
                const options = {year: 'numeric', month: 'long', day: 'numeric' }
                const filteredMovie = {
                    title: data.title,
                    description: data.overview,
                    imdbUrl: data.homepage,
                    genres: data.genres?.map(genre => genre.name),
                    budget: data.budget,
                    releaseDate: data.release_date? new Date(data.release_date).toLocaleDateString('en-US',options) : null,
                    revenue: data.revenue,
                    runtime: data.runtime,
                    tagline: data.tagline,
                    rating: data.vote_average,
                    language: data.original_language,
                    voteCount: data.vote_count,
                    companies:data.production_companies,
                    imgUrl: data.poster_path ? `https://image.tmdb.org/t/p/w342${data.poster_path}` : 'https://faculty.eng.ufl.edu/dobson-lab/wp-content/uploads/sites/88/2015/11/img-placeholder.png',
                    backdropUrl: `https://image.tmdb.org/t/p/w1280${data.backdrop_path}`,
                    cast: data.credits.cast?.slice(0,20).map(c =>  ({
                        id: c.id,
                        name: c.name, 
                        pictureUrl: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : 'https://static.stayjapan.com/assets/user_no_photo-4896a2d64d70a002deec3046d0b6ea6e7f01628781493566c95a02361524af97.png', 
                        character:c.character
                    })),
                    producers: data.credits.crew?.filter(c => c.job === "Producer").map(c => c.name),
                    directors: data.credits.crew?.filter(c => c.job === "Director").map(c => c.name),
                    reviews: data.reviews.results?.slice(0,3).map(r => ({
                        id:r.id,
                        content: r.content,
                        author: r.author_details.name || r.author_details.username,
                        rating: r.author_details.rating,
                        profileUrl: r.author_details.avatar_path? r.author_details.avatar_path.substring(0,5) !== '/http' ? `https://image.tmdb.org/t/p/w45${r.author_details.avatar_path}` : r.author_details.avatar_path.substring(1) :'https://static.stayjapan.com/assets/user_no_photo-4896a2d64d70a002deec3046d0b6ea6e7f01628781493566c95a02361524af97.png',
                        date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-US',options) : null
                    })),
                    trailerUrl: data.videos.results?.find(r => r.site === 'YouTube' && r.type === "Trailer")?.key

                }
                console.log(filteredMovie.trailerUrl)
                setMovie(filteredMovie)
            })
            .catch(err => {
                if(err)
                    setError(err.message)
            })
    },[id])

    if(error) {
        return(
            <h3 className='text-muted text-center' style={{margin:'15% auto', minHeight:'50vh'}}>{error}<br />Try again</h3>
        )
    }

    if(movie) {
        const genres = movie.genres?.map(g => <p className='genre-pill' key={g}>{g}</p>)    
        const producers = movie.producers?.map((p, idx) => idx !== movie.producers.length - 1 ? p + ', ' : p)
        const directors = movie.directors?.map((p, idx) => idx !== movie.directors.length - 1 ? p + ', ' : p)
        const reviews = movie.reviews?.map(r => {
            return(
                <div className='review-card' key={r.id}>
                    <div className='d-flex align-items-center'>
                        <img src={r.profileUrl} height='45px' width='45px' alt={r.author}/>
                        <div className='ml-2'>
                            <h6>{r.author}</h6>
                            <p className='font-weight-light mb-0' style={{fontSize:'95%'}}>{r.date}{r.rating? ' • ⭐'+ r.rating : null}</p>
                        </div>
                    </div>
                    <hr style={{borderColor:'gray'}} className='mt-1'/>
                    <p className='font-weight-light'>{r.content}</p>
                </div>
            )
        })
        const cast = movie.cast?.map(c => {
            return (
                <div className='cast-card' key={c.id} onClick={() => dispCast(c.id)}>
                    <img src={c.pictureUrl} alt='actor' />
                    <div className='px-2 pb-1 pt-2' style={{height:'max-content'}}>
                        <h5>{c.name}</h5>
                        <h6 className='font-weight-light'>as {c.character || '-'}</h6>
                    </div>
                </div>
            )
        })
        return(
            <div className='movie-page'>
                <div className='movie-page-header' style={{backgroundImage:'linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)),url('+ movie.backdropUrl + ')'}}>
                    <img src={movie.imgUrl} alt="movie poster" className='d-none d-md-block' height="512px" width="342px" />
                    <div className='header-details'>
                        <a href={movie.imdbUrl} title="Visit movie website">{movie.title}</a>
                        <h5 className='font-weight-light font-italic'>{movie.tagline}</h5>
                        <div>{genres}</div>
                        <h5 className='my-2'>⭐{movie.rating || 'NR'}{movie.voteCount ? <small className='text-warning'> ({movie.voteCount} votes)</small> : null}</h5>
                        <p className='text-muted font-weight-bold'>{languages[movie.language].name} • {movie.releaseDate || 'In Production'} {movie.runtime? `• ${movie.runtime} mins` : null}</p>
                        <div>
                            <b>Producer(s): </b>
                            <p>{producers && producers.length? producers : '-'}</p>
                            <b>Director(s): </b>
                            <p>{directors && directors.length? directors : '-'}</p>
                        </div>
                        <p>
                            <b>Estimated Budget:</b> {movie.budget ? '$'+movie.budget.toLocaleString('en-UK') : '-'} | <b>Gross Revenue: </b>{movie.revenue ? '$'+movie.revenue.toLocaleString('en-UK') : '-'}
                        </p>
                        { inWatchlist ? <DeleteButton movieId={id} onClick={() => setInWatchlist(false)}/> 
                        : <AddButton onClick={() => setInWatchlist(true)} movieId={id} 
                            name={JSON.stringify({title:movie.title, rating:movie.rating, imgUrl:movie.imgUrl, releaseDate:movie.releaseDate})}
                        />}
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
                            <Col xs className='mb-5'>
                                <h3 className='movie-page-heading'>Top Cast Cembers</h3>
                                <div className='cast-feed'>
                                   {cast && cast.length? cast : <p className='text-muted font-italic'>cast details unavailable</p>}
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={reviewFeedExpanded? 12: true} className='mb-3'>
                                <h3 className='movie-page-heading mb-0'>Top Reviews</h3>
                                <div ref={reviewFeedRef} className='review-feed' style={{maxHeight: reviewFeedExpanded?"100%":"300px", overflowY:'hidden', position:'relative', borderRadius:"1rem"}}>
                                    {reviews && reviews.length? reviews: <p className='mt-2 text-muted font-italic'>reviews unavailable</p>}
                                    {!reviewFeedExpanded && reviews && reviews.length ? <div style={{height:"50%", position:'absolute', backgroundImage:'linear-gradient(0deg, black, rgba(0,0,0,0.3), transparent)', width:'100%', bottom:'0'}} /> : null}
                                </div>
                                {reviews && reviews.length ? <p className='review-expand-btn' onClick={() => setReviewFeedExpanded(!reviewFeedExpanded)}>{reviewFeedExpanded? "Collapse ᐱ": "Read more ᐯ"}</p>:null}
                            </Col>
                        {movie.trailerUrl ? 
                            <Col xs={12} md={6} className='mb-5'>
                                <h3 className='movie-page-heading mb-3'>Trailer</h3>
                                <div> 
                                    <YoutubeEmbed embedId={movie.trailerUrl} />
                                </div>
                            </Col> : null}
                        </Row>
                    </Container>
                </div>
            </div>
        )
    }

    return (
        <SkeletonTheme color="#505050" highlightColor="#303030">
            <LoadingComponent page="movie" />
        </SkeletonTheme>
    )
}

export default MovieComponent