import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/settings - Buscar todas as configurações ou uma específica
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const category = searchParams.get('category');

    if (key) {
      // Buscar configuração específica
      const setting = await prisma.setting.findUnique({
        where: { key }
      });

      if (!setting) {
        return NextResponse.json({ error: 'Configuração não encontrada' }, { status: 404 });
      }

      // Converter o valor baseado no tipo
      let value = setting.value;
      if (setting.type === 'json') {
        try {
          value = JSON.parse(setting.value || '{}');
        } catch {
          value = {};
        }
      } else if (setting.type === 'boolean') {
        value = setting.value === 'true';
      } else if (setting.type === 'number') {
        value = parseFloat(setting.value || '0');
      }

      return NextResponse.json({
        ...setting,
        value
      });
    }

    // Buscar todas as configurações (opcionalmente filtradas por categoria)
    const where = category ? { category } : {};
    const settings = await prisma.setting.findMany({
      where,
      orderBy: { key: 'asc' }
    });

    // Converter valores baseado no tipo
    const processedSettings = settings.map(setting => {
      let value = setting.value;
      if (setting.type === 'json') {
        try {
          value = JSON.parse(setting.value || '{}');
        } catch {
          value = {};
        }
      } else if (setting.type === 'boolean') {
        value = setting.value === 'true';
      } else if (setting.type === 'number') {
        value = parseFloat(setting.value || '0');
      }

      return {
        ...setting,
        value
      };
    });

    return NextResponse.json(processedSettings);
  } catch (error) {
    console.error('[SETTINGS] Erro ao buscar configurações:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST /api/settings - Criar nova configuração
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, type = 'string', category = 'general' } = body;

    if (!key) {
      return NextResponse.json({ error: 'Chave é obrigatória' }, { status: 400 });
    }

    // Converter valor para string baseado no tipo
    let stringValue = value;
    if (type === 'json') {
      stringValue = JSON.stringify(value);
    } else if (type === 'boolean') {
      stringValue = value ? 'true' : 'false';
    } else if (type === 'number') {
      stringValue = value.toString();
    } else {
      stringValue = value?.toString() || '';
    }

    const setting = await prisma.setting.create({
      data: {
        key,
        value: stringValue,
        type,
        category
      }
    });

    console.log(`[SETTINGS] Configuração criada: ${key} = ${stringValue}`);

    return NextResponse.json(setting, { status: 201 });
  } catch (error) {
    console.error('[SETTINGS] Erro ao criar configuração:', error);
    
    // Verificar se é erro de chave duplicada
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Configuração já existe. Use PUT para atualizar.' }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT /api/settings - Atualizar configuração existente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, type, category } = body;

    if (!key) {
      return NextResponse.json({ error: 'Chave é obrigatória' }, { status: 400 });
    }

    // Verificar se a configuração existe
    const existingSetting = await prisma.setting.findUnique({
      where: { key }
    });

    if (!existingSetting) {
      return NextResponse.json({ error: 'Configuração não encontrada' }, { status: 404 });
    }

    // Converter valor para string baseado no tipo
    const settingType = type || existingSetting.type;
    let stringValue = value;
    
    if (settingType === 'json') {
      stringValue = JSON.stringify(value);
    } else if (settingType === 'boolean') {
      stringValue = value ? 'true' : 'false';
    } else if (settingType === 'number') {
      stringValue = value.toString();
    } else {
      stringValue = value?.toString() || '';
    }

    const updateData: any = { value: stringValue };
    if (type) updateData.type = type;
    if (category) updateData.category = category;

    const setting = await prisma.setting.update({
      where: { key },
      data: updateData
    });

    console.log(`[SETTINGS] Configuração atualizada: ${key} = ${stringValue}`);

    return NextResponse.json(setting);
  } catch (error) {
    console.error('[SETTINGS] Erro ao atualizar configuração:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE /api/settings - Deletar configuração
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Chave é obrigatória' }, { status: 400 });
    }

    await prisma.setting.delete({
      where: { key }
    });

    console.log(`[SETTINGS] Configuração deletada: ${key}`);

    return NextResponse.json({ message: 'Configuração deletada com sucesso' });
  } catch (error) {
    console.error('[SETTINGS] Erro ao deletar configuração:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 