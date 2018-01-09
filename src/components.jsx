import { Dropdown, Transition, Form, Button, Icon } from 'semantic-ui-react';
import React, { Component } from 'react';

class DropDown extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: "",
		}
	}
	onChange(e, d) {
		this.setState({value: d.value});
		if (this.props.onChange) this.props.onChange(e, d);
	}
	render() {
		return (
			<div>
				<Dropdown placeholder={this.props.placeholder} scrolling fluid {...this.props} selection
					onChange={(e, d) => this.onChange(e, d)} options={this.props.options} />
				<input type="hidden" value={this.state.value} name={this.props.name} />
			</div>
		);
	}
}

class GracefulTransition extends Component {
	constructor(props) {
		super(props);
		this.state = {
			visible: false,
		}
		let t = this;
		setTimeout(function() {t.toggle()}, 100);
	}
	toggle() {
		this.setState({visible: !this.state.visible});
	}
	render() {
		return (
			<Transition visible={this.state.visible} animation={this.props.animation || "fade"} duration={this.props.duration || 500}>
				{this.props.children}
			</Transition>
		);
	}
}

class DynamicFields extends Component {
	render() {
		return (
			<Form.Group>
				{this.props.elements}
				<Form.Field>
					<Button type="button" onClick={this.props.onClick}>
						<Icon name="plus" />
						{this.props.expl || "New element"}
					</Button>
				</Form.Field>
			</Form.Group>
		);
	}
}

export { DropDown, GracefulTransition, DynamicFields };