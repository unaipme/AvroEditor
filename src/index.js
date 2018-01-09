import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { TextArea, Modal, Button, Icon, Form, Input, Divider, Segment } from 'semantic-ui-react';
import ReactQueryParams from 'react-query-params';
import { DropDown, DynamicFields, GracefulTransition } from './components'

class RecordAlias extends Component {
	remove() {
		this.tr.toggle();
		setTimeout(() => this.props.onRemove(this.props.index), 500);
	}
	render() {
		return (
			<GracefulTransition animation="fade right" ref={tr => this.tr = tr}>
				<Form.Field className="avroAlias">
					<div className="ui action input">
						<input type="text" name={`${this.props.name}[aliases][${this.props.index}]`} placeholder="Alias" />
						<Button type="button" onClick={() => this.remove()}><Icon name="remove" /></Button>
					</div>
				</Form.Field>
			</GracefulTransition>
		);
	}
}

class RecordField extends Component {
	constructor(props) {
		super(props);
		let types = [
			{key: "boolean", value: "boolean", text: "Boolean"},
			{key: "int", value: "int", text: "Integer"},
			{key: "long", value: "long", text: "Long"},
			{key: "float", value: "float", text: "Float"},
			{key: "double", value: "double", text: "Double"},
			{key: "bytes", value: "bytes", text: "Bytes"},
			{key: "string", value: "string", text: "String"},
			{key: "null", value: "null", text: "Null"},
			{key: "record", value: "record", text: "Record"},
			{key: "array", value: "array", text: "Array"},
		];
		this.state = {
			isRecord: false,
			isArray: false,
			type: [],
			types: types,
			list: this.props.list.map((k, v) => {return {key: v, value: v, text: v};})
		};
	}
	onTypeChange(e) {
		this.setState({
			isRecord: e.value.includes("record"),
			isArray: e.value.includes("array"),
			type: e.value
		});
	}
	render() {
		return (
			<GracefulTransition>
				<div>
					<h4>Field #{this.props.index}</h4>
					<div className="two fields">
						<Form.Field>
							<label>Name</label>
							<Input type="text" name={`${this.props.name}[fields][${this.props.index}][name]`} placeholder="Field name" />
						</Form.Field>
						<Form.Field>
							<label>Types</label>
							<DropDown onChange={(_, e) => this.onTypeChange(e)} name={`${this.props.name}[fields][${this.props.index}][type]`} multiple options={this.state.types.concat(this.state.list)} placeholder="Types"/>
						</Form.Field>
					</div>
					{ this.state.isRecord &&
						<GracefulTransition>
							<Form.Group>
								<Form.Field>
									<RecordEditor name={`${this.props.name}[fields][${this.props.index}][record]`} default="newRecord" list={this.props.list} />
								</Form.Field>
							</Form.Group>
						</GracefulTransition>
					}
					{ this.state.isArray &&
						<GracefulTransition>
							<Form.Group>
								<Form.Field>
									<DropDown name={`${this.props.name}[fields][${this.props.index}][items]`} placeholder="Choose a primitive type for the array" options={this.state.types} />
								</Form.Field>
							</Form.Group>
						</GracefulTransition>
					}
				</div>
			</GracefulTransition>
		);
	}
}

class RecordEditor extends Component {
	constructor(props) {
		super(props);
		this.state = {
			aliases: [],
			fields: [],
		}
	}
	newAlias() {
		var n = this.state.aliases.length;
		var a = this.state.aliases.slice();
		a.push(<RecordAlias key={n.toString()} index={n} onRemove={(x) => this.removeAlias(x)} name={this.props.name} />);
		this.setState({aliases: a});
	}
	newField() {
		var a = this.state.fields.slice();
		var n = this.state.fields.length;
		a.push(<RecordField key={n.toString()} index={n} name={this.props.name} list={this.props.list} />);
		this.setState({fields: a});
	}
	removeAlias(n) {
		var a = this.state.aliases.slice();
		a.splice(n, 1);
		this.setState({aliases: a});
	}
	updateList(d) {
		this.props.list.set(this.props.index, d.value);
	}
	render() {
		return (
			<Segment textAlign="left">
				<h3>Record information</h3>
				<Form.Field>
					<label>Name</label>
					<Input type="text" name={`${this.props.name}[name]`} placeholder="Give this record a name" value={this.props.default} onChange={(_, d) => this.updateList(d)} />
				</Form.Field>
				<Form.Field>
					<label>Aliases</label>
					<DynamicFields elements={this.state.aliases} expl="New alias" onClick={() => this.newAlias()} />
				</Form.Field>
				<Form.Field>
					<label>Documentation</label>
					<Input type="text" name={`${this.props.name}[doc]`} placeholder="Write here some documentation for this record" />
				</Form.Field>
				<h3>Fields</h3>
				<Form.Field>
					{this.state.fields}
				</Form.Field>
				<Form.Field>
					<Button type="button" onClick={() => this.newField()}>
						<Icon name="plus" />
						New field
					</Button>
				</Form.Field>
			</Segment>
		);
	}
}

class App extends ReactQueryParams {
	constructor(props) {
		super(props);
		this.state = {
			records: new Map(),
			submitted: this.queryParams["record[name]"] !== undefined,
			avro: ""
		};
	}
	parseArray(name) {
		let q = this.queryParams;
		let avro = {};
		avro.type = "array";
		avro.items = q[`${name}[items]`];
		return avro;
	}
	parseRecord(name) {
		let q = this.queryParams;
		let avro = {};
		avro.name = q[`${name}[name]`];
		avro.type = "record";
		if (q[`${name}[doc]`]) avro.doc = q[`${name}[doc]`];
		if (q[`${name}[aliases][0]`]) {
			let i = 0;
			avro.aliases = [];
			while (q[`${name}[aliases][${i}]`]) {
				avro.aliases.push(q[`${name}[aliases][${i++}]`]);
			}
		}
		if (q[`${name}[fields][0][name]`]) {
			let i = 0;
			avro.fields = [];
			while (q[`${name}[fields][${i}][name]`]) {
				let f = {};
				f.name = q[`${name}[fields][${i}][name]`];
				let t = q[`${name}[fields][${i}][type]`].split(",");
				f.type = [];
				for (let j = 0; j < t.length; j++) {
					if (t[j] === "record") f.type.push(this.parseRecord(`${name}[fields][${i}][record]`));
					else if (t[j] === "array") f.type.push(this.parseArray(`${name}[fields][${i}]`));
					else f.type.push(t[j]);
				}
				if (f.type.length === 1) f.type = f.type[0];
				avro.fields.push(f);
				i++;
			}
		}
		return avro;
	}
	generate() {
		this.setState({avro: JSON.stringify(this.parseRecord("record"), undefined, 4)});
	}
	render() {
		return (
			<Segment as={Form} textAlign="center" action="/">
				<RecordEditor name="record" list={this.state.records}/>
				<Divider />
				<Button positive>Generate</Button>
				<Modal open={this.state.submitted} onMount={() => this.generate()}>
					<Modal.Header>Here's your schema!</Modal.Header>
					<Modal.Content as={Form}>
						<TextArea readOnly autoHeight={true} value={this.state.avro}/>
						<Modal.Description>Please, be sure to check out if it's a valid schema <a href="https://json-schema-validator.herokuapp.com/avro.jsp">on this site</a>, since this project is still in early development.</Modal.Description>
					</Modal.Content>
				</Modal>
			</Segment>
		);
	}
}

ReactDOM.render(
	<App />,
	document.getElementById("root")
);