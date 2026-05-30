import { Link } from 'react-router-dom'

export default function Sidebar({ trendingAlbums, musicDirectors }) {
  return (
    <div className="sidebar">
      <section className="widget">
        <h4>Trending Albums</h4>
        <ul>
          {trendingAlbums.map((album) => (
            <li key={album.id}>
              <Link to={`/album/${album.slug}`}>{album.title}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="widget">
        <h4>Browse by Music Directors</h4>
        <ul>
          {musicDirectors.map((name) => (
            <li key={name}>
              {/* You can later create a route like /music/:name */}
              <span>{name}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
