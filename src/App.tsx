import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

const AlbumDetail = () => {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState<Schema["Album"]["type"] | null>(null);

  useEffect(() => {
    if (!albumId) return;

    const fetchAlbum = async () => {
      try {
        const { data } = await client.models.Album.get({ id: albumId });
        setAlbum(data);
      } catch (error) {
        console.error('Error fetching album', error);
        navigate('/albums');
      }
    };

    fetchAlbum();
  }, [albumId, navigate]);

  if (!album) {
    return <div>Loading album...</div>;
  }

  return (
    <div>
      <h2>{album.Title}</h2>
      <p>By: {album.Artist}</p>
    </div>
  );
};

const Albums = () => {
  const [albums, setAlbums] = useState<Array<Schema["Album"]["type"]>>([]);

  useEffect(() => {
    const sub = client.models.Album.observeQuery().subscribe({
      next: (data) => setAlbums([...data.items]),
    });

    return () => sub.unsubscribe();
  }, []);

  return (
    <div>
      <h2>Albums Page</h2>
      <p>This is where the albums will be displayed.</p>
      <ul>
        {albums.map(({ id, Artist, Title }) => (
          <li key={id}>
            <Link to={`/albums/${id}`}>{Title} by {Artist}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Users = () => {
  return (
    <div>
      <h2>Users Page</h2>
      <p>This is where the users will be displayed.</p>
    </div>
  );
};

function App() {
  const { user, signOut } = useAuthenticator();

  return (
    <main>
      <h1>Welcome, {user?.signInDetails?.loginId}</h1>

      <nav>
        <Link to="/albums">Albums</Link> | <Link to="/users">Users</Link>
      </nav>

      <hr />

      <Routes>
        <Route path="/albums" element={<Albums />} />
        <Route path="/albums/:albumId" element={<AlbumDetail />} />
        <Route path="/users" element={<Users />} />
        {/* Default route */}
        <Route path="/" element={<Albums />} />
      </Routes>

      <div>
        🥳 App successfully running.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
