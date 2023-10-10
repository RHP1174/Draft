import React, { ChangeEvent, Component } from "react";
import { DraftPick } from "./pick";

interface AppState {
  id: undefined | number
  startPage: boolean;
  drafter: string
  drafters: string;
  options: string;
  rounds: string;
  joinID: undefined | number;
}

export class App extends Component<{}, AppState> {

  constructor(props: any) {
    super(props);

    this.state = { 
      id: 1,
      startPage: true,
      drafter: "",
      drafters: "",
      options: "",
      rounds: "",
      joinID: undefined
    };
  }

  render = (): JSX.Element => {
    if (this.state.startPage === true) {
      return (
        <div>
          <label>Drafter: </label>
          <input type="text" value={this.state.drafter} onChange={this.currDrafterTextChange}></input>
          <span><strong> (Required For Either Option) </strong></span>
          <div>
            <h2>Join Existing Draft</h2>
            <div>
              <label>Draft ID: </label>
              <input type="text" value={this.state.joinID} onChange={this.handleIDChange}></input>
              <div>
                <button onClick={this.handleJoin}>Join</button>
                <div>
                  <h2>Create New Draft</h2>
                  <div>
                    <label>Rounds: </label>
                    <input type="number" min={0} className="numberInput" value={this.state.rounds} onChange={this.roundsTextChange}></input>
                    <div>
                      <div>
                        <label>Options (One Per Line) </label>
                        <label className="custom-spacing">Drafters (One Per Line, In Order)</label>
                      </div>
                      <div>
                        <textarea id="options" value={this.state.options} onChange={this.opsTextChange}></textarea>
                        <textarea id="drafters" value={this.state.drafters} onChange={this.draftersTextChange}></textarea>
                      </div>
                      <div>
                        <button onClick={this.handleCreate}>Create</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return <DraftPick id={this.state.id} currDrafter={this.state.drafter} back={this.handleBack}/>
    }
  };

  handleBack = (): void => {
    this.setState({startPage: !this.state.startPage})
  }

  handleIDChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({joinID: Number(evt.target.value)});
  }

  currDrafterTextChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({drafter: evt.target.value});
  }

  roundsTextChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({rounds: evt.target.value});
  }

  draftersTextChange = (evt: ChangeEvent<HTMLTextAreaElement>): void => {
    this.setState({drafters: evt.target.value});
  }

  opsTextChange = (evt: ChangeEvent<HTMLTextAreaElement>): void => {
    this.setState({options: evt.target.value});
  }

  handleJoin = (): void => {
    fetch("/api/join?id=" + this.state.joinID)
      .then(this.handleJoinResponse)
      .catch(this.handleServerError);
    
  }

  handleJoinResponse = (res: Response): void => {
    if (res.status === 200) {
      res.json().then(this.handleJoinJson).catch(this.handleServerError);
    } else {
      this.handleServerError(res);
    }
  }

  handleJoinJson = (val: string): void => {
    if (JSON.parse(val) === `Error: No draft with ID:${this.state.joinID}`) {
      alert(`Error: No draft with ID:${this.state.joinID}`);
    } else if (this.state.drafter === '') {
      alert(`Error: Enter a valid Drafter name`);
    } else {
      this.setState({id: this.state.joinID, startPage: !this.state.startPage});
    }
  }

  handleCreate = (): void => {
    fetch("/api/create", {
      method: "POST", 
      body: JSON.stringify({"rounds": this.state.rounds, 
                            "options": this.state.options, 
                            "drafters": this.state.drafters, 
                            "drafter": this.state.drafter}),
      headers: {"Content-Type": "application/json"}})
      .then(this.handleCreateResponse)
      .catch(this.handleServerError);
  }

  handleCreateResponse = (res: Response): void => {
    if (res.status === 200) {
      res.json().then(this.handleCreateJson).catch(this.handleServerError);
    } else {
      this.handleServerError(res);
    }
  }

  handleCreateJson = (val: string): void => {
    if (JSON.parse(val) === `Error: Number of rounds is empty!`) {
      alert(`Error: Number of rounds is empty!`);
    } else if (JSON.parse(val) === `Error: There's no options to choose from!`) {
      alert(`Error: There's no options to choose from!`);
    } else if (JSON.parse(val) === `Error: There's no drafters!`) {
      alert(`Error: There's no drafters!`);
    } else if (JSON.parse(val) === `Error: Enter valid Drafter name!`) {
      alert(`Error: Enter valid Drafter name!`);
    } else if (JSON.parse(val) === `Error: There's too many drafters than available options!`) {
      alert(`Error: There's too many drafters than available options!`);
    } else {
      this.setState({id: JSON.parse(val).id, 
                     drafter: JSON.parse(val).drafter, 
                     startPage: !this.state.startPage});
    }
  }

  handleServerError = (_: Response) => {
    console.error(`Unknown error in the server.`);
  };
}