'use strict'

const React = require('react')
const { PureComponent } = React
const { func, instanceOf } = require('prop-types')
const { Toolbar, ToolbarContext, ToolGroup } = require('../toolbar')
const { IconButton } = require('../button')
const { EditorState } = require('prosemirror-state')
const { LinkToolbar } = require('./link')


const {
  IconB,
  IconI,
  IconU,
  IconS,
  IconQ,
  IconSup,
  IconSub,
  //  IconAlignLeft,
  //  IconAlignCenter,
  //  IconAlignRight,
  IconBulletList,
  IconNumberedList,
  IconSink,
  IconLift,
  IconLink
} = require('../icons')


class EditorToolbar extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      context: 'default',
      marks: this.getActiveMarks(props.state),
    }

    this.cmd = {}

    for (const action of [
      'bold',
      'italic',
      'underline',
      'overline',
      'strikethrough',
      'subscript',
      'superscript',
      'blockquote',
      'ol',
      'ul',
      'liftListItem',
      'sinkListItem'
    ]) {
      this.cmd[action] = () => this.props.onCommand(action)
    }
  }

  componentWillReceiveProps(props) {
    if (props.state !== this.props.state) {
      this.setState({
        marks: this.getActiveMarks(props.state)
      })
    }
  }

  get hasDefaultContext() {
    return this.state.context === 'default'
  }

  get hasLinkContext() {
    return this.state.context === 'link'
  }

  getActiveMarks(state = this.props.state) {
    let res = {}, mark

    for (mark in state.schema.marks) {
      res[mark] = this.isMarkActive(state.schema.marks[mark], state)
    }

    return res
  }

  isMarkActive(type, state = this.props.state) {
    const { from, $from, to, empty } = state.selection

    return (empty) ?
      !!type.isInSet(state.storedMarks || $from.marks()) :
      state.doc.rangeHasMark(from, to, type)
  }

  renderMarkButton(name, icon) {
    return (
      <IconButton
        noFocus
        icon={icon}
        isActive={this.state.marks[name]}
        title={`editor.commands.${name}`}
        onMouseDown={this.cmd[name]}/>
    )
  }

  setDefaultContext = () => {
    this.setState({ context: 'default' })
  }

  setLinkContext = () => {
    this.setState({ context: 'link' })
  }

  handleLinkToggle = (attrs) => {
    // expand selection to include full link (only when deleting)
    if (this.state.marks.link) {
      this.props.onCommand('removeLink')
    } else {
      this.props.onCommand('insertLink', attrs)
    }
    this.setDefaultContext()
  }

  handleLinkButtonClick = () => {
    if (this.state.marks.link) this.handleLinkToggle()
    else this.setLinkContext()
  }

  render() {
    return (
      <Toolbar isDraggable={false}>
        <ToolbarContext
          className="default"
          isActive={this.hasDefaultContext}>
          <div className="toolbar-left">
            <ToolGroup>
              {this.renderMarkButton('bold', <IconB/>)}
              {this.renderMarkButton('italic', <IconI/>)}
              {this.renderMarkButton('underline', <IconU/>)}
              {this.renderMarkButton('overline', <IconU/>)}
              {this.renderMarkButton('strikethrough', <IconS/>)}
              <IconButton
                noFocus
                icon={<IconQ/>}
                title="editor.commands.blockquote"
                onMouseDown={this.cmd.blockquote}/>
            </ToolGroup>
            <ToolGroup>
              {this.renderMarkButton('superscript', <IconSup/>)}
              {this.renderMarkButton('subscript', <IconSub/>)}
            </ToolGroup>
            {/*<ToolGroup>
              <IconButton
                isDisabled
                noFocus
                icon={<IconAlignLeft/>}
                isActive={false}
                title="editor.commands.left"
                onMouseDown={this.cmd.left}/>
              <IconButton
                isDisabled
                noFocus
                icon={<IconAlignCenter/>}
                isActive={false}
                title="editor.commands.center"
                onMouseDown={this.cmd.center}/>
              <IconButton
                isDisabled
                noFocus
                icon={<IconAlignRight/>}
                isActive={false}
                title="editor.commands.right"
                onMouseDown={this.cmd.right}/>
            </ToolGroup>*/}
            <ToolGroup>
              <IconButton
                noFocus
                icon={<IconBulletList/>}
                title="editor.commands.ul"
                onMouseDown={this.cmd.ul}/>
              <IconButton
                noFocus
                icon={<IconNumberedList/>}
                title="editor.commands.ol"
                onMouseDown={this.cmd.ol}/>
              <IconButton
                noFocus
                icon={<IconSink/>}
                onMouseDown={this.cmd.sinkListItem}/>
              <IconButton
                noFocus
                icon={<IconLift/>}
                onMouseDown={this.cmd.liftListItem}/>
            </ToolGroup>
            <ToolGroup>
              <IconButton
                noFocus
                isActive={this.state.marks.link}
                title="editor.commands.link.button"
                icon={<IconLink/>}
                onMouseDown={this.handleLinkButtonClick}/>
            </ToolGroup>
          </div>
        </ToolbarContext>
        <LinkToolbar
          isActive={this.hasLinkContext}
          onCancel={this.setDefaultContext}
          onCommit={this.handleLinkToggle}/>
      </Toolbar>
    )
  }

  static propTypes = {
    state: instanceOf(EditorState),
    onCommand: func.isRequired
  }

  static defaultProps = {
  }
}

module.exports = {
  EditorToolbar
}
