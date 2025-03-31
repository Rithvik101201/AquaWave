const audio = document.querySelector('#audio');
const albumGrid = document.querySelector('.album-grid')
const songTitle = document.querySelector('.current-song-title')
const songArtist = document.querySelector('.current-song-artist')

let songsDetails = [];

const fetchSongs = async ()=>{
    try{
        const res = await fetch('/api/songs')
        console.log('Songs has been successfully fetched')
        const songs = await res.json();
        renderSongs(songs)
        songsDetails = songs;
    }catch(err){
        console.log('Error while fetching songs')
    }
}

const renderSongs = (songs) =>{
    albumGrid.innerHTML = '';

    songs.forEach((song, index)=>{
        const songCard = document.createElement('div');
        songCard.className = 'album-card';

        songCard.innerHTML=`
            <img src="${song.coverImg}" class="cover-img">
            <h3 class="song-title">${song.title}</h3>
            <p class="song-artist">${song.artist}</p>
            <p class="song-genre">${song.genre}</p>
            <button class="play-btn" data-index="${index}">Play</button>
        `

        albumGrid.appendChild(songCard);
    })
}

const playSong = (index, songsDetails)=>{

    const song = songsDetails[index];

    audio.src = song.file_path;
    audio.play()
    .then(()=>{
        songTitle.textContent = song.title
        songArtist.textContent = song.artist
    })
    .catch((err)=>{
        console.log(`Error while playing song`)
    })
}

document.addEventListener('click', (ev)=>{
    if(ev.target.classList.contains('play-btn')){
        const songIndex = ev.target.getAttribute('data-index');
        playSong(songIndex, songsDetails)
    }
})

document.addEventListener('DOMContentLoaded', fetchSongs)