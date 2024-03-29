/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { BASE_URL } from './constants';
import LocalStorage from './localStorage';

const get = async url => {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const data = await res.json();
  return data;
};

const post = async (url, body) => {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  return res.json();
};

const put = async (url, data) => {
  if (data && !data.deviceId) {
    data.deviceId = LocalStorage.get('device-id');
  }
  const res = await fetch(`${BASE_URL}${url}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  return json;
};

const del = async (url: string, data?: unknown) => {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: data ? JSON.stringify(data) : undefined
  });

  return res.status;
};

const uploadFile = async (url: string, file: File) => {
  console.log('Uploading file...');
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
};

export default { get, post, put, del, uploadFile };
