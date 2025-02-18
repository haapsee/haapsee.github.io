import './App.css';

const data = require("./data.json");

let lastColor = "";

function randomColor() {
    let colors = [
        "red",
        "blue",
        "green",
        "orange",
        "purple",
        "deepskyblue",
    ];
    let color = colors[Math.floor(Math.random() * colors.length)];
    if (color === lastColor) {
        return randomColor();
    } else {
        lastColor = color;
        return color;
    }
}

function App() {
    return (
        <section className="container">
            <section className="section header" style={{"display": "flex", "justifyContent": "space-between"}}>
                <section className="profile" style={{"width": "50%"}}>
                    <h1>{data?.user?.name}</h1>
                    <p style={{"color": "gray", fontSize: "0.7rem"}}>Following: {data?.user?.following}, Followers: {data?.user?.followers}</p>
                    <p>{data?.user?.bio}</p>
                    <ul>
                        <li><a href={data?.user?.html_url}>github</a></li>
                        {data?.socialAccounts?.map((account, index) => (
                            <li key={index}><a href={account.url}>{account.provider}</a></li>
                        ))}
                    </ul>
                </section>

                <section className="skills" style={{"width": "50%"}}>
                    <div style={{"display": "flex", "justifyContent": "center"}}>
                    <img src={data?.user?.avatar_url} alt="User avatar" className="avatar" style={{"width": "200px", "borderRadius": "200px"}}/>
                    </div>
                    <ul>
                    {Object.keys(data?.preferredLanguages || {}).sort((a, b) => {
                        return parseFloat(data?.preferredLanguages[b]) - parseFloat(data?.preferredLanguages[a]);
                    }).map((lang, index) => (
                        <li key={index} className="skill"><span style={{backgroundColor: randomColor()}}>{lang}</span></li> 
                    ))}
                    </ul>
                </section>
            </section>

            <section className='section projects'>
                <h2>Featured Projects</h2>
                <div>
                    {data?.portfolioRepos?.map((repo, index) => (
                        <div key={index} className="project-card">
                            <h3 className="project-name">{repo.name}</h3>
                            <p className='project-license'>{repo.license?.name}</p>
                            <p className='project-description'>{repo.description}</p>
                            <p className='project-languages'>{repo.languages.map((lang, index) => (
                                <span key={index} className="language"><span>{lang}</span></span>
                            ))}</p>
                            <a href={repo.html_url} className="project-link-button">View Project</a>
                        </div>
                    ))}
                </div>
            </section>
        </section>

    );
}

export default App;
