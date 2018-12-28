import React, { Component } from "react";
import axios from "axios";
import "./App.css";
import breadcrumb from '@ecl/ec-react-component-breadcrumb';

const DEFAULT_QUERY = "redux";
const DEFAULT_HPP = "10";

const PATH_BASE = "https://hn.algolia.com/api/v1";
const PATH_SEARCH = "/search";
const PARAM_SEARCH = "query=";
const PARAM_PAGE = "page=";
const PARAM_HPP = "hitsPerPage=";

const source = axios.CancelToken.source();
const cancelToken = source.token;

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            results: null,
            searchKey: "",
            searchTerm: DEFAULT_QUERY,
            error: null
        };

        this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
        this.setSearchTopStories = this.setSearchTopStories.bind(this);
        this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
        this.onSearchSubmit = this.onSearchSubmit.bind(this);
        this.onSearchChange = this.onSearchChange.bind(this);
        this.onDismiss = this.onDismiss.bind(this);
    }

    componentDidMount() {
        const { searchTerm, page } = this.state;
        this.setState({ searchKey: searchTerm });

        this.fetchSearchTopStories(searchTerm, page);
    }

    componentWillUnmount() {
        source.cancel();
    }

    needsToSearchTopStories(searchTerm) {
        return this.state.results && this.state.results[searchTerm]
            ? false
            : true;
    }

    setSearchTopStories(result) {
        const { page, hits } = result;
        const { searchKey, results } = this.state;
        const oldHits =
            results && results[searchKey] ? results[searchKey].hits : [];

        const updatedHits = [...oldHits, ...hits];

        this.setState({
            results: {
                ...results,
                [searchKey]: { hits: updatedHits, page }
            }
        });
    }

    fetchSearchTopStories(searchTerm, page = 0) {
        axios
            .get(
                `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`,
                { cancelToken }
            )
            .then(({ data }) => this.setSearchTopStories(data))
            .catch(
                error =>
                    !axios.isCancel(error) ? this.setState({ error }) : null
            );
    }

    onDismiss = id => {
        const { searchKey, results } = this.state;
        const { hits, page } = results[searchKey];
        const isNotID = item => item.objectID !== id;
        const updatedHits = hits.filter(isNotID);

        this.setState({
            results: {
                ...results,
                [searchKey]: { hits: updatedHits, page }
            }
        });
    };

    onSearchChange(event) {
        this.setState({ searchTerm: event.target.value });
    }

    onSearchSubmit(event) {
        const { searchTerm } = this.state;
        this.setState({ searchKey: searchTerm });
        if (this.needsToSearchTopStories(searchTerm)) {
            this.fetchSearchTopStories(searchTerm, 0);
        }
        event.preventDefault(); // stop form submit
    }

    render() {
        const { searchTerm, results, searchKey, error } = this.state;
        const page =
            (results && results[searchKey] && results[searchKey].page) || 0;
        const list =
            (results && results[searchKey] && results[searchKey].hits) || [];

        return (
            <div className="page">
                <div className="interactions">
                    <Search
                        value={searchTerm}
                        id="searchTerm"
                        onChange={this.onSearchChange}
                        onSubmit={this.onSearchSubmit}
                    >
                        search
                    </Search>
                </div>

                {error ? (
                    <div className="interactions">
                        <p>Something went wrong.</p>
                    </div>
                ) : (
                        <ErrorBoundary error={error}>
                            <Table list={list} onClick={this.onDismiss} />

                            <div className="interactions">
                                <Button
                                    type="button"
                                    onClick={() =>
                                        this.fetchSearchTopStories(
                                            searchKey,
                                            page + 1
                                        )
                                    }
                                >
                                    More
                            </Button>
                            </div>
                        </ErrorBoundary>
                    )}
            </div>
        );
    }
}

const Button = ({ onClick, className, children, type }) => (
    <button onClick={onClick} className={className} type={type}>
        {children}
    </button>
);

const Search = ({ value, onChange, onSubmit, children }) => (
    <form onSubmit={onSubmit}>
        <input
            id="search"
            type="text"
            value={value}
            onChange={onChange}
            onSubmit={onSubmit}
        />
        <Button type="submit">{children}</Button>
    </form>
);

const Table = ({ list, onClick }) => (
    <div className="table">
        {list.map(item => (
            <div key={item.objectID} className="table-row">
                <span style={{ width: "40%" }}>
                    <a href={item.url}>{item.title}</a>
                </span>
                <span style={{ width: "30%" }}>{item.author}</span>
                <span style={{ width: "10%" }}>{item.num_comments}</span>
                <span style={{ width: "10%" }}>{item.points}</span>
                <span style={{ width: "10%" }}>
                    <Button
                        onClick={() => onClick(item.objectID)}
                        className="button-inline"
                    >
                        Dismiss
                    </Button>
                </span>
            </div>
        ))}
    </div>
);

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            errorInfo: null
        };
    }

    componentDidCatch(error, errorInfo) {
        // Catch errors in any components below and re-render with error message
        this.setState({
            error: null,
            errorInfo: null
        });
        // You can also log error messages to an error reporting service here
    }

    render() {
        if (this.state.errorInfo) {
            // Error path
            return (
                <div className="interactions">
                    <p>Something went wrong.</p>
                </div>
            );
        }
        // Normally, just render children
        return this.props.children;
    }
}

export { Button, Search, Table, ErrorBoundary };

export default App;
