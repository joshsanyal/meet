import React from "react";
import Form from "react-jsonschema-form";
import API from "@aws-amplify/api";
import Loading from "./loading";
import { Redirect } from "react-router";

const schema = {
  title: "Post your ideas for other hackers to see!",
  type: "object",
  required: [],
  properties: {
    idea: { type: "string", title: "Challenge ideas" },
    verticals: {
      title: "challenges i'm interested in",
      type: "array",
      uniqueItems: true,
      items: {
        type: "string",
        enum: [
          "education",
          "medical access",
          "voice assistance",
          "iot",
          "ar/vr",
          "geospatial"
        ]
      }
    },
    pronouns: { type: "string", title: "Pronouns" },
    showProfile: {
      type: "boolean",
      title: "Yes! Show my profile and allow other hackers to contact me.",
      default: true
    }
  }
};

const uiSchema = {
  idea: {
    "ui:widget": "textarea",
    "ui:placeholder":
      "Pitch an idea and/or tell other hackers about yourself! (150 words max)"
  },
  pronouns: {
    "ui:placeholder":
      "Gender pronouns (optional)"
  },
  verticals: {
    "ui:widget": "checkboxes"
  }
};

const log = type => console.log.bind(console, type);

class MeetForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formSchema: schema,
      dataFetched: false,
      redirect: false
    };
  }

  async componentDidMount() {
    const meet_info = await API.get(
      "treehacks",
      `/users/${this.props.user.username}/forms/meet_info`,
      {}
    );
    console.log(meet_info);
    if (meet_info) {
      for (const index in meet_info) {
        if (!(index in this.state.formSchema["properties"])) continue;
        this.state.formSchema["properties"][index]["default"] =
          meet_info[index];
      }
      this.setState({
        formSchema: this.state.formSchema,
        dataFetched: true
      });
    }
  }

  async submitForm(e) {
    const form = { body: e.formData };
    console.log("Data submitted: ", form);
    const resp = await API.put(
      "treehacks",
      `/users/${this.props.user.username}/forms/meet_info`,
      form
    );
    console.log(resp);
    this.setState({ redirect: true });
  }

  render() {
    if (!this.state.dataFetched) {
      return <Loading />;
    }
    else {
      return (
        <div id="form">
          <Form
            schema={this.state.formSchema}
            uiSchema={uiSchema}
            onChange={log("changed")}
            onSubmit={e => this.submitForm(e)}
            onError={log("errors")}
          />
          {this.state.redirect && <Redirect to="/" />};
        </div>
      );
    }
  }
}

export default MeetForm;
