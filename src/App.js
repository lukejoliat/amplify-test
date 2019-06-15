import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import awsconfig from './aws-exports';
import Amplify, { Analytics, Storage, API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator, S3Album } from 'aws-amplify-react';

Amplify.configure(awsconfig);
Storage.configure({ level: 'private' });

const listTodos = `query listTodos {
  listTodos{
    items{
      id
      name
      description
    }
  }
}`

const addTodo = `mutation createTodo($name:String! $description: String!) {
  createTodo(input:{
    name:$name
    description:$description
  }){
    id
    name
    description
  }
}`

class App extends Component {
  state = { todos: [] };

  uploadFile = (evt) => {
    const file = evt.target.files[0];
    const name = file.name;

    Storage.put(name, file).then(() => {
      this.setState({ file: name });
    })
  }
  
  todoMutation = async () => {
    const todoDetails = {
      name: 'Party tonight!',
      description: 'Amplify CLI rocks!'
    };
    
    const newTodo = await API.graphql(graphqlOperation(addTodo, todoDetails));
    await this.listQuery();
  }
  
  listQuery = async () => {
    const response = await API.graphql(graphqlOperation(listTodos));
    const todos = response.data.listTodos.items;
    if (todos) this.setState({ todos });
  }
  
  async componentDidMount () {
    await this.listQuery();
  }

  render() {
    return (
      <div className="App">
        <p> Pick a file</p>
        <input type="file" onChange={this.uploadFile} />
        <button onClick={this.listQuery}>GraphQL Query</button>
        <button onClick={this.todoMutation}>GraphQL Mutation</button>
        <S3Album level="private" path='' />
        { this.state.todos.map(t => <div key={t.id}>{t.name}</div>) }
      </div>
    );
  }
}

export default withAuthenticator(App, true);
