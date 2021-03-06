'use babel'

/* @flow */
/** @jsx React.h */

import React from 'preact'
import { getMessageClass, getMessageRange, visitMessage } from '../helpers'
import type { Linter$Message } from '../types'

const DEFAULT_LINE_CLASS = 'linter-message-item badge badge-flexible linter-highlight'
const NEWLINE = /\r\n|\n/
let MESSAGE_NUMBER = 0

export default class Message extends React.Component {
  static getName(message: Linter$Message) {
    return <span className={ DEFAULT_LINE_CLASS }>{ message.name }</span>
  }
  static getRibbon(message: Linter$Message) {
    const messageClass = getMessageClass(message)
    return <span className={ `${DEFAULT_LINE_CLASS} ${messageClass}` }>{ message.type }</span>
  }
  static getLink(message: Linter$Message) {
    const messageRange = getMessageRange(message)
    let linkContent = messageRange ?
      `at line ${messageRange.start.row + 1} col ${messageRange.start.column + 1}` :
      ''
    linkContent += ` in ${atom.project.relativizePath(message.filePath)[1]}`
    return <a href="#" className="linter-message-link" onClick={() => visitMessage(message) }>{ linkContent }</a>
  }
  static getCopyLink(message: Linter$Message) {
    return <a href="#" className="linter-message-copy-link" onClick={() => atom.clipboard.write(message.text || message.html) } />
  }
  static getSingleLineMessage(message: Linter$Message, includeLink: boolean) {
    const number = ++MESSAGE_NUMBER
    const elementID = `linter-message-${number}`
    const isElement = message.html && typeof message.html === 'object'
    if (isElement) {
      setImmediate(function() {
        const element = document.getElementById(elementID)
        if (element) {
          // $FlowIgnore: This is an HTML Element :\
          element.appendChild(message.html.cloneNode(true))
        } else {
          console.warn('[Linter] Unable to get element for mounted message', number, message)
        }
      })
    }

    return (<span>
      <linter-message-line id={elementID} dangerouslySetInnerHTML={ !isElement && message.html ? { __html: message.html } : null }>
        { message.text }
      </linter-message-line>
      { includeLink && message.filePath ? Message.getLink(message) : null }
    </span>)
  }
  static getMultiLineMessage(message: Linter$Message) {
    const chunks = message.text ? message.text.split(NEWLINE) : []
    const children = []
    chunks.forEach(function(chunk, index) {
      chunk = chunk.trim()
      if (chunk.length) {
        children.push(<linter-message-line>{ chunk }</linter-message-line>)
        if (index === 0) {
          children.push(Message.getLink(message))
        }
      }
    })
    return (<span>
      <linter-multiline-message onClick={function onClick(e) {
        const link = e.target.tagName === 'A' ? e.target : e.target.parentNode

        if (!link.classList.contains('linter-message-link')) {
          this.classList.toggle('expanded')
        }
      }}>{ children }</linter-multiline-message>
    </span>)
  }

  render() {
    const { message, includeLink, includeProvider } = this.props
    return (<linter-message>
      { Message.getCopyLink(message) }
      { includeProvider && message.name ? Message.getName(message) : null }
      { Message.getRibbon(message) }
      { message.multiline || NEWLINE.test(message.text || '') ?
        Message.getMultiLineMessage(message) :
        Message.getSingleLineMessage(message, includeLink)}
    </linter-message>)
  }
}

export function getElement(message: Linter$Message, includeLink: boolean = true, includeProvider: boolean = true): HTMLElement {
  const element = document.createElement('div')
  React.render(<Message message={message} includeLink={includeLink} includeProvider={includeProvider} />, element)
  return element
}
