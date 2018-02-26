import React from "react";
import ReactDOM from "react-dom";
import renderer from "react-test-renderer";
import Enzyme, { shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import App, { Search, Button, Table } from "./App";

Enzyme.configure({ adapter: new Adapter() });

describe("App", () => {
    it("renders without crashing", () => {
        const div = document.createElement("div");
        ReactDOM.render(<App />, div);
        ReactDOM.unmountComponentAtNode(div);
    });

    test("has a valid snapshot", () => {
        const component = renderer.create(<App />);
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("should respond to a change event and change the state of the App Component", () => {
        const element = shallow(<App />);
        element
            .find("#searchTerm")
            .simulate("change", { target: { value: "cats" } });

        expect(element.state("searchTerm")).toEqual("cats");
    });
});

describe("Search", () => {
    const props = {
        className: "search-class"
    };

    const children = "Sample text";

    let str = "";

    it("renders without crashing", () => {
        const div = document.createElement("div");
        ReactDOM.render(<Search {...props}>{children}</Search>, div);
    });

    test("has a valid snapshot", () => {
        const component = renderer.create(
            <Search {...props}>{children}</Search>
        );
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("has one form", () => {
        const element = shallow(<Search {...props}>{children}</Search>);
        const form = element.find("form");
        expect(form.length).toBe(1);
    });

    it("has one button", () => {
        const element = shallow(<Search {...props}>{children}</Search>);
        const button = element.find("Button");
        expect(button.length).toBe(1);
    });
});

describe("Table", () => {
    const props = {
        list: [
            {
                title: "1",
                author: "1",
                num_comments: 1,
                points: 2,
                objectID: "y"
            },
            {
                title: "2",
                author: "2",
                num_comments: 1,
                points: 2,
                objectID: "z"
            }
        ]
    };

    it("renders without crashing", () => {
        const div = document.createElement("div");
        ReactDOM.render(<Table {...props} />, div);
    });

    test("has a valid snapshot", () => {
        const component = renderer.create(<Table {...props} />);
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("shows two items in list", () => {
        const element = shallow(<Table {...props} />);
        expect(element.find(".table-row").length).toBe(2);
    });
});

describe("Button", () => {
    const props = {
        className: "button-class"
    };

    it("renders without crashing", () => {
        const div = document.createElement("div");
        ReactDOM.render(<Button>Give Me More</Button>, div);
    });

    test("has a valid snapshot", () => {
        const component = renderer.create(<Button>Give Me More</Button>);
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("shows correct text", () => {
        const element = shallow(<Button {...props}>Sample text</Button>);
        const button = element.find(".button-class");
        expect(button.text()).toBe("Sample text");
    });
});
