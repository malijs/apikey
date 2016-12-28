import test from 'ava'
import path from 'path'
import caller from 'grpc-caller'
import Mali from 'mali'
import grpc from 'grpc'

import apikey from '../'

function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getHostport (port) {
  return '0.0.0.0:'.concat(port || getRandomInt(1000, 60000))
}

const PROTO_PATH = path.resolve(__dirname, './apikey.proto')
const DYNAMIC_HOST = getHostport()
const apps = []
let client

test.before('should dynamically create service', t => {
  function handler (ctx) {
    ctx.res = { message: ctx.req.message.toUpperCase() }
  }

  async function auth1 (key, ctx, next) {
    if (key !== '11111') throw new Error('Not Authorized')
    await next()
  }

  async function auth2 (key, ctx, next) {
    if (key !== '22222') throw new Error('Unauthorized')
    await next()
  }

  const app = new Mali(PROTO_PATH, 'APIKeyService')
  t.truthy(app)
  apps.push(app)

  app.use('fn1', apikey(auth1), handler)
  app.use('fn2', apikey({ keyField: 'api_key', error: 'Unauthorized' }, auth2), handler)
  const server = app.start(DYNAMIC_HOST)

  t.truthy(server)

  client = caller(DYNAMIC_HOST, PROTO_PATH, 'APIKeyService')
})

test('Should fail with fn1 withouth metadata', async t => {
  t.plan(2)
  const error = await t.throws(client.fn1({ message: 'hello' }))
  t.is(error.message, 'Not Authorized')
})

test('Should fail with fn1 without authorization', async t => {
  t.plan(2)
  const meta = new grpc.Metadata()
  meta.add('foo', 'bar')
  const error = await t.throws(client.fn1({ message: 'hello' }, meta))
  t.is(error.message, 'Not Authorized')
})

test('Should fail with fn1 without correct authorization', async t => {
  t.plan(2)
  const meta = new grpc.Metadata()
  meta.add('Authorization', 'bar')
  const error = await t.throws(client.fn1({ message: 'hello' }, meta))
  t.is(error.message, 'Not Authorized')
})

test('Should fail with fn1 without correct bearer authorization', async t => {
  t.plan(2)
  const meta = new grpc.Metadata()
  meta.add('Authorization', 'apikey')
  const error = await t.throws(client.fn1({ message: 'hello' }, meta))
  t.is(error.message, 'Not Authorized')
})

test('Should fail with fn1 without correct bearer authorization 2', async t => {
  t.plan(2)
  const meta = new grpc.Metadata()
  meta.add('Authorization', 'APIKey ')
  const error = await t.throws(client.fn1({ message: 'hello' }, meta))
  t.is(error.message, 'Not Authorized')
})

test('Should fail with fn1 without correct bearer authorization 3', async t => {
  t.plan(2)
  const meta = new grpc.Metadata()
  meta.add('Authorization', 'apikey foo')
  const error = await t.throws(client.fn1({ message: 'hello' }, meta))
  t.is(error.message, 'Not Authorized')
})

test('Should fail with fn1 without correct bearer authorization 4', async t => {
  t.plan(2)
  const meta = new grpc.Metadata()
  meta.add('Authorization', 'apikey1111')
  const error = await t.throws(client.fn1({ message: 'hello' }, meta))
  t.is(error.message, 'Not Authorized')
})

test('Should work with fn1 with correct authorization', async t => {
  t.plan(1)
  const meta = new grpc.Metadata()
  meta.add('Authorization', 'apikey 11111')
  const response = await client.fn1({ message: 'hello' }, meta)
  t.is(response.message, 'HELLO')
})

test('Should work with fn1 with correct authorization 2', async t => {
  t.plan(1)
  const meta = new grpc.Metadata()
  meta.add('authoRiZaTion', 'ApiKey 11111')
  const response = await client.fn1({ message: 'hello' }, meta)
  t.is(response.message, 'HELLO')
})

test('Should fail with fn2 withouth metadata', async t => {
  t.plan(2)
  const error = await t.throws(client.fn2({ message: 'hello' }))
  t.is(error.message, 'Unauthorized')
})

test('Should fail with fn2 without authorization', async t => {
  t.plan(2)
  const meta = new grpc.Metadata()
  meta.add('foo', 'bar')
  const error = await t.throws(client.fn2({ message: 'hello' }, meta))
  t.is(error.message, 'Unauthorized')
})

test('Should fail with fn2 without correct authorization', async t => {
  t.plan(2)
  const meta = new grpc.Metadata()
  meta.add('Authorization', 'bar')
  const error = await t.throws(client.fn2({ message: 'hello' }, meta))
  t.is(error.message, 'Unauthorized')
})

test('Should fail with fn2 without correct authorization 2', async t => {
  t.plan(2)
  const meta = new grpc.Metadata()
  meta.add('Authorization', 'apikey 22222')
  const error = await t.throws(client.fn2({ message: 'hello' }, meta))
  t.is(error.message, 'Unauthorized')
})

test('Should fail with fn2 without correct authorization 3', async t => {
  t.plan(2)
  const meta = new grpc.Metadata()
  meta.add('Authorization', 'api_key 22221')
  const error = await t.throws(client.fn2({ message: 'hello' }, meta))
  t.is(error.message, 'Unauthorized')
})

test('Should work with fn2 with correct authorization', async t => {
  t.plan(1)
  const meta = new grpc.Metadata()
  meta.add('Authorization', 'api_key 22222')
  const response = await client.fn2({ message: 'hello' }, meta)
  t.is(response.message, 'HELLO')
})

test('Should work with fn2 with correct authorization 2', async t => {
  t.plan(1)
  const meta = new grpc.Metadata()
  meta.add('authoRiZaTion', 'ApI_kEy 22222')
  const response = await client.fn2({ message: 'hello' }, meta)
  t.is(response.message, 'HELLO')
})

test.after.always('guaranteed cleanup', t => {
  apps.forEach(app => app.close())
})
